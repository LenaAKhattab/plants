"""
Out-of-distribution safety filter — permissive guard, not a strict plant detector.

Real leaf photos may have purple/white/gray backgrounds, brown diseased tissue,
small leaves, or low quality. We only block *obvious* non-photos: flat logos,
screenshots, UI panels, and cartoons.

When unsure, prefer Uncertain over Invalid image.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configurable thresholds (permissive — tune using validation_debug in responses)
# ---------------------------------------------------------------------------
VALIDATION_SIZE = (256, 256)

# Model confidence overrides weak validation scores.
CONFIDENCE_ACCEPT_OVERRIDE = 75.0

# Below this → Uncertain (matches notebook-style gate).
CONFIDENCE_UNCERTAIN_BELOW = 60.0

# Overall naturalness score below this = "weak validation" (with medium confidence → Uncertain).
WEAK_VALIDATION_SCORE = 0.28

# Clearly non-natural / graphic-like (must also have low confidence to reject as Invalid).
TEXTURE_CLEARLY_LOW = 0.07
ENTROPY_CLEARLY_LOW = 0.22
SOLID_COLOR_CLEARLY_HIGH = 0.70
BRAND_COLOR_GRAPHIC = 0.20
FLAT_BLOCK_GRAPHIC = 0.75


@dataclass
class ValidationScores:
    green_ratio: float
    plant_color_ratio: float
    texture_score: float
    entropy_score: float
    solid_color_score: float
    saturation_variance: float
    validation_score: float
    is_clearly_non_natural: bool
    rejection_reason: str | None

    def to_debug_dict(self) -> dict:
        return {
            "green_ratio": round(self.green_ratio, 4),
            "plant_color_ratio": round(self.plant_color_ratio, 4),
            "texture_score": round(self.texture_score, 4),
            "entropy_score": round(self.entropy_score, 4),
            "solid_color_score": round(self.solid_color_score, 4),
            "validation_score": round(self.validation_score, 4),
            "rejection_reason": self.rejection_reason,
        }


def _rgb_to_hsv_array(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    rgb_f = rgb.astype(np.float32) / 255.0
    r, g, b = rgb_f[..., 0], rgb_f[..., 1], rgb_f[..., 2]
    cmax = np.max(rgb_f, axis=-1)
    cmin = np.min(rgb_f, axis=-1)
    delta = cmax - cmin

    hue = np.zeros_like(cmax)
    mask = delta > 1e-6
    r_max = mask & (cmax == r)
    g_max = mask & (cmax == g)
    b_max = mask & (cmax == b)
    hue[r_max] = (60.0 * ((g[r_max] - b[r_max]) / delta[r_max]) + 360.0) % 360.0
    hue[g_max] = (60.0 * ((b[g_max] - r[g_max]) / delta[g_max]) + 120.0) % 360.0
    hue[b_max] = (60.0 * ((r[b_max] - g[b_max]) / delta[b_max]) + 240.0) % 360.0

    saturation = np.zeros_like(cmax)
    np.divide(delta, cmax, out=saturation, where=cmax > 1e-6)
    value = cmax
    return hue, saturation, value


def _green_mask(hue: np.ndarray, sat: np.ndarray, val: np.ndarray) -> np.ndarray:
    return (hue >= 25) & (hue <= 95) & (sat >= 0.08) & (val >= 0.10)


def _plant_color_mask(hue: np.ndarray, sat: np.ndarray, val: np.ndarray) -> np.ndarray:
    """Greens, yellows, browns — diseased leaves often lack green."""
    green = _green_mask(hue, sat, val)
    yellow = (hue >= 12) & (hue <= 52) & (sat >= 0.08) & (val >= 0.12)
    brown = (hue >= 5) & (hue <= 42) & (sat >= 0.10) & (val >= 0.06) & (val <= 0.78)
    olive = (hue >= 35) & (hue <= 75) & (sat >= 0.06) & (val >= 0.08) & (val <= 0.60)
    return green | yellow | brown | olive


def _laplacian_variance(gray: np.ndarray) -> float:
    g = gray.astype(np.float32)
    center = g[1:-1, 1:-1]
    lap = 4.0 * center - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:]
    return float(lap.var())


def _gray_entropy(gray: np.ndarray) -> float:
    hist, _ = np.histogram(gray.flatten(), bins=256, range=(0, 256), density=True)
    hist = hist[hist > 0]
    return float(-np.sum(hist * np.log2(hist)))


def _dominant_color_ratio(rgb: np.ndarray) -> float:
    small = rgb[::2, ::2].reshape(-1, 3)
    quantized = (small // 16).astype(np.int32)
    bins = quantized[:, 0] * 256 + quantized[:, 1] * 16 + quantized[:, 2]
    if bins.size == 0:
        return 1.0
    _, counts = np.unique(bins, return_counts=True)
    return float(counts.max() / bins.size)


def _flat_block_ratio(gray: np.ndarray, block: int = 8, std_thresh: float = 6.0) -> float:
    h, w = gray.shape
    h_trim, w_trim = h - (h % block), w - (w % block)
    if h_trim < block or w_trim < block:
        return 0.0
    patches = (
        gray[:h_trim, :w_trim]
        .reshape(h_trim // block, block, w_trim // block, block)
        .transpose(0, 2, 1, 3)
        .reshape(-1, block * block)
    )
    return float((patches.std(axis=1) < std_thresh).mean())


def _primary_brand_ratio(rgb: np.ndarray) -> float:
    r, g, b = rgb[..., 0].astype(np.float32), rgb[..., 1], rgb[..., 2]
    strong_red = (r > 180) & (g < 90) & (b < 90)
    strong_blue = (b > 180) & (r < 90) & (g < 120)
    return float((strong_red | strong_blue).mean())


def score_image(img: Image.Image) -> ValidationScores:
    """
    Soft scoring for natural leaf photos vs flat graphics.
    Low plant_color_ratio alone never triggers rejection.
    """
    rgb = np.asarray(
        img.convert("RGB").resize(VALIDATION_SIZE, Image.Resampling.BILINEAR),
        dtype=np.uint8,
    )
    gray = np.mean(rgb.astype(np.float32), axis=-1)
    hue, sat, val = _rgb_to_hsv_array(rgb)

    green_ratio = float(_green_mask(hue, sat, val).mean())
    plant_color_ratio = float(_plant_color_mask(hue, sat, val).mean())

    texture_raw = _laplacian_variance(gray)
    entropy_raw = _gray_entropy(gray)
    dominant = _dominant_color_ratio(rgb)
    flat_ratio = _flat_block_ratio(gray)
    brand_ratio = _primary_brand_ratio(rgb)
    sat_var = float(sat.var())

    texture_score = min(1.0, texture_raw / 120.0)
    entropy_score = min(1.0, entropy_raw / 5.5)
    solid_color_score = dominant
    sat_var_score = min(1.0, sat_var / 0.025)
    plant_bonus = min(1.0, plant_color_ratio / 0.05)

    validation_score = float(
        0.34 * texture_score
        + 0.26 * entropy_score
        + 0.14 * plant_bonus
        + 0.12 * sat_var_score
        + 0.14 * (1.0 - solid_color_score)
    )

    reasons: list[str] = []

    flat_and_dull = texture_score < TEXTURE_CLEARLY_LOW and entropy_score < ENTROPY_CLEARLY_LOW
    huge_solid = solid_color_score > SOLID_COLOR_CLEARLY_HIGH
    logo_like = brand_ratio > BRAND_COLOR_GRAPHIC and texture_score < 0.18
    ui_like = flat_ratio > FLAT_BLOCK_GRAPHIC and texture_score < 0.14
    no_natural_signal = (
        plant_color_ratio < 0.015
        and texture_score < 0.10
        and entropy_score < 0.28
    )

    if flat_and_dull:
        reasons.append("very flat with low entropy (logo/screenshot-like)")
    if huge_solid:
        reasons.append("large solid-color regions")
    if logo_like:
        reasons.append("strong brand/UI primary colors with low texture")
    if ui_like:
        reasons.append("mostly flat UI-like blocks")
    if no_natural_signal:
        reasons.append("no plant-like color and no natural texture")

    is_clearly_non_natural = bool(reasons)
    rejection_reason = "; ".join(reasons) if reasons else None

    return ValidationScores(
        green_ratio=green_ratio,
        plant_color_ratio=plant_color_ratio,
        texture_score=texture_score,
        entropy_score=entropy_score,
        solid_color_score=solid_color_score,
        saturation_variance=sat_var,
        validation_score=validation_score,
        is_clearly_non_natural=is_clearly_non_natural,
        rejection_reason=rejection_reason,
    )


def should_return_invalid(scores: ValidationScores, confidence: float) -> bool:
    """
    Invalid image only when clearly non-natural AND confidence is low.
    High-confidence predictions bypass validation rejection.
    """
    if confidence >= CONFIDENCE_ACCEPT_OVERRIDE:
        return False
    if confidence >= CONFIDENCE_UNCERTAIN_BELOW:
        return False
    return scores.is_clearly_non_natural


def should_force_uncertain(scores: ValidationScores, confidence: float) -> bool:
    """Weak validation with medium confidence → Uncertain, not Invalid."""
    if confidence >= CONFIDENCE_ACCEPT_OVERRIDE:
        return False
    if confidence < CONFIDENCE_UNCERTAIN_BELOW:
        return True
    if scores.is_clearly_non_natural:
        return True
    if scores.validation_score < WEAK_VALIDATION_SCORE:
        return True
    return False


def invalid_image_response(validation_debug: dict | None = None) -> dict:
    payload = {
        "status": "Invalid image",
        "predicted_class": None,
        "plant_name": None,
        "condition": None,
        "confidence": 0,
        "top_k": [],
        "advice": (
            "Please upload a clear photo of a single plant leaf. "
            "Avoid screenshots, logos, drawings, or unrelated objects."
        ),
        "is_valid_leaf_image": False,
    }
    if validation_debug is not None:
        payload["validation_debug"] = validation_debug
    return payload
