"""
Plant Disease Detection API — matches plants.ipynb prediction logic.

Loads EfficientNetB0 Keras model once at startup.
POST /predict accepts an image and returns classification JSON.
"""

from __future__ import annotations

import io
import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from tensorflow.keras.utils import img_to_array

from advice import (
    build_explanation,
    get_advice,
    get_health_status,
    parse_class_name,
)
from image_validation import (
    CONFIDENCE_ACCEPT_OVERRIDE,
    CONFIDENCE_UNCERTAIN_BELOW,
    invalid_image_response,
    score_image,
    should_force_uncertain,
    should_return_invalid,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths & constants (aligned with notebook section 1 / 16)
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model"
KERAS_MODEL_PATH = MODEL_DIR / "plant_disease_efficientnet_model.keras"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"
METADATA_PATH = MODEL_DIR / "model_metadata.json"

IMG_SIZE = (224, 224)
# Confidence gate (notebook-aligned): below 60% → Uncertain; >= 60% → Healthy/Diseased.
CONFIDENCE_UNCERTAIN_BELOW = 60.0
CONFIDENCE_ACCEPT_OVERRIDE = 75.0  # high confidence bypasses weak validation
TOP_K = 3
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/jpg"}

# Populated on startup
model: tf.keras.Model | None = None
class_names: list[str] = []
metadata: dict[str, Any] = {}


def load_metadata() -> dict[str, Any]:
    if METADATA_PATH.is_file():
        with open(METADATA_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def load_class_names() -> list[str]:
    if not CLASS_NAMES_PATH.is_file():
        raise FileNotFoundError(
            f"class_names.json not found at {CLASS_NAMES_PATH}. "
            "Export it from the training notebook (section 17)."
        )
    with open(CLASS_NAMES_PATH, encoding="utf-8") as f:
        names = json.load(f)
    if not isinstance(names, list) or not names:
        raise ValueError("class_names.json must be a non-empty JSON array of class name strings.")
    return names


def image_size_from_model(loaded: tf.keras.Model) -> tuple[int, int]:
    """Read H×W from the saved Keras model (source of truth for inference)."""
    shape = loaded.input_shape
    if shape and len(shape) == 4 and shape[1] and shape[2]:
        return (int(shape[1]), int(shape[2]))
    raise ValueError(f"Could not read input size from model.input_shape: {shape}")


def load_keras_model() -> tf.keras.Model:
    if not KERAS_MODEL_PATH.is_file():
        raise FileNotFoundError(
            f"Model file not found at {KERAS_MODEL_PATH}. "
            "Place plant_disease_efficientnet_model.keras in backend/model/."
        )
    loaded = tf.keras.models.load_model(str(KERAS_MODEL_PATH))
    out_shape = loaded.output_shape
    if out_shape is None or out_shape[-1] is None:
        raise ValueError("Loaded model has invalid output_shape.")
    if int(out_shape[-1]) != len(class_names):
        raise ValueError(
            f"Model output size ({int(out_shape[-1])}) != len(class_names) ({len(class_names)})."
        )
    return loaded


def resolve_status(confidence: float, predicted_class: str) -> str:
    """Notebook-style: Uncertain if confidence < 60%, else Healthy/Diseased."""
    if confidence < CONFIDENCE_UNCERTAIN_BELOW:
        return "Uncertain"
    return get_health_status(predicted_class)


def predict_from_array(img_array: np.ndarray) -> dict[str, Any]:
    """
    Core inference — mirrors predict_image() in the notebook:
    expand batch dim, predict, top-k, confidence threshold, health status.
    """
    if model is None:
        raise RuntimeError("Model is not loaded.")

    batch = np.expand_dims(img_array, axis=0)
    probs = model.predict(batch, verbose=0)[0]

    if len(probs) != len(class_names):
        raise ValueError(
            f"Prediction vector length ({len(probs)}) != len(class_names) ({len(class_names)})."
        )

    k = min(TOP_K, len(class_names))
    order = np.argsort(probs)[-k:][::-1]

    predicted_index = int(order[0])
    predicted_class = class_names[predicted_index]
    confidence = float(probs[predicted_index] * 100)
    status = resolve_status(confidence, predicted_class)

    top_k_list = []
    for rank, idx in enumerate(order, start=1):
        cname = class_names[int(idx)]
        top_k_list.append(
            {
                "rank": rank,
                "predicted_class": cname,
                "confidence": round(float(probs[idx] * 100), 2),
                "status": get_health_status(cname),
            }
        )

    plant_name, condition = parse_class_name(predicted_class)
    explanation = build_explanation(status, predicted_class, confidence, plant_name, condition)
    advice = get_advice(status, predicted_class, plant_name, condition)

    return {
        "status": status,
        "predicted_class": predicted_class,
        "plant_name": plant_name,
        "condition": condition,
        "confidence": round(confidence, 2),
        "top_k": top_k_list,
        "advice": advice,
        "explanation": explanation,
        "is_valid_leaf_image": True,
    }


def load_rgb_image(content: bytes) -> Image.Image:
    """Open upload as RGB PIL image (full resolution for validation)."""
    try:
        img = Image.open(io.BytesIO(content))
        return img.convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.") from exc


def preprocess_for_model(img: Image.Image) -> np.ndarray:
    """Resize to model input and return float array [0, 255] — matches notebook."""
    resized = img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
    return img_to_array(resized)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, class_names, metadata, IMG_SIZE, CONFIDENCE_UNCERTAIN_BELOW, CONFIDENCE_ACCEPT_OVERRIDE

    startup_error: str | None = None
    try:
        metadata.update(load_metadata())
        class_names[:] = load_class_names()

        uncertain_below = metadata.get("confidence_uncertain_below")
        accept_override = metadata.get("confidence_accept_override")
        if uncertain_below is not None:
            CONFIDENCE_UNCERTAIN_BELOW = float(uncertain_below)
        if accept_override is not None:
            CONFIDENCE_ACCEPT_OVERRIDE = float(accept_override)

        model = load_keras_model()
        model_size = image_size_from_model(model)
        meta_size = metadata.get("image_size")
        if isinstance(meta_size, list) and len(meta_size) == 2:
            meta_tuple = (int(meta_size[0]), int(meta_size[1]))
            if meta_tuple != model_size:
                logger.warning(
                    "model_metadata.json image_size %s != model input %s; using model size.",
                    meta_tuple,
                    model_size,
                )
        IMG_SIZE = model_size
        logger.info(
            "Model loaded: %s (%d classes, image %dx%d, uncertain below %.1f%%, accept override %.1f%%)",
            KERAS_MODEL_PATH.name,
            len(class_names),
            IMG_SIZE[0],
            IMG_SIZE[1],
            CONFIDENCE_UNCERTAIN_BELOW,
            CONFIDENCE_ACCEPT_OVERRIDE,
        )
    except Exception as exc:
        startup_error = str(exc)
        logger.error("Startup failed: %s", startup_error)

    app.state.startup_error = startup_error
    app.state.model_ready = model is not None
    yield
    model = None


app = FastAPI(
    title="Plant Disease Detection API",
    description="EfficientNetB0 classifier — graduation project demo",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    # Vite may use 5173, 5174, … if the default port is taken
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    ready = model is not None and not getattr(app.state, "startup_error", None)
    return {
        "status": "ok" if ready else "degraded",
        "model_loaded": ready,
        "num_classes": len(class_names) if class_names else 0,
        "error": getattr(app.state, "startup_error", None),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if getattr(app.state, "startup_error", None):
        raise HTTPException(
            status_code=503,
            detail=f"Model not available: {app.state.startup_error}",
        )
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {file.content_type}. Use JPEG, PNG, WebP, or BMP.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 15 MB).")

    img = load_rgb_image(content)
    validation = score_image(img)
    validation_debug = validation.to_debug_dict()

    img_array = preprocess_for_model(img)

    try:
        result = predict_from_array(img_array)
    except Exception as exc:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    confidence = float(result["confidence"])

    # Safety guard: reject only obvious non-photos with low model confidence.
    if should_return_invalid(validation, confidence):
        logger.info(
            "Invalid image: %s (confidence=%.1f%%, validation_score=%.3f)",
            validation.rejection_reason,
            confidence,
            validation.validation_score,
        )
        return invalid_image_response(validation_debug)

    # Prefer Uncertain over Invalid when validation is weak but not clearly a graphic.
    if should_force_uncertain(validation, confidence):
        result["status"] = "Uncertain"
        plant_name, condition = parse_class_name(result["predicted_class"])
        result["explanation"] = build_explanation(
            "Uncertain", result["predicted_class"], confidence, plant_name, condition
        )
        result["advice"] = get_advice("Uncertain", result["predicted_class"], plant_name, condition)

    result["validation_debug"] = validation_debug
    return result
