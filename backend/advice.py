"""Friendly explanations and care advice derived from PlantVillage-style class labels."""

from __future__ import annotations


def parse_class_name(class_name: str) -> tuple[str, str]:
    """Split 'Crop___condition' into display-friendly plant and condition strings."""
    if "___" not in class_name:
        return class_name.replace("_", " "), class_name.replace("_", " ")
    crop, condition = class_name.split("___", 1)
    plant = crop.replace("_", " ").strip()
    cond = condition.replace("_", " ").strip()
    return plant, cond


def get_health_status(class_name: str) -> str:
    """Match notebook: Healthy iff segment after first '___' equals 'healthy'."""
    if "___" not in class_name:
        return "Diseased"
    _crop, disease_part = class_name.split("___", 1)
    return "Healthy" if disease_part == "healthy" else "Diseased"


def build_explanation(
    status: str,
    predicted_class: str,
    confidence: float,
    plant_name: str,
    condition: str,
) -> str:
    if status == "Uncertain":
        return (
            f"The model is not confident enough ({confidence:.1f}%) to classify this leaf reliably. "
            "Try a clearer photo: single leaf, good lighting, minimal blur, and fill most of the frame. "
            "If symptoms persist, consult an agronomist or plant clinic."
        )
    if status == "Invalid or Uncertain":
        return (
            f"Confidence is very low ({confidence:.1f}%) — the model match is too weak for a reliable diagnosis. "
            "Upload a clearer leaf photo; do not treat based on this result alone."
        )
    if status == "Healthy":
        return (
            f"This leaf appears healthy for {plant_name} with {confidence:.1f}% model confidence. "
            "Continue regular monitoring for early spots, discoloration, or pest damage."
        )
    return (
        f"The model suggests {plant_name} may be affected by {condition} "
        f"({confidence:.1f}% confidence). Confirm with local extension guidance before treating."
    )


# Keyword-based treatment hints (generic educational advice, not a substitute for expert diagnosis).
_DISEASE_ADVICE: dict[str, str] = {
    "apple scab": "Remove fallen leaves, improve air circulation, and apply labeled fungicides early in the season.",
    "black rot": "Prune infected tissue, sanitize tools, and avoid overhead watering on fruit crops.",
    "cedar apple rust": "Remove nearby juniper hosts when possible and use rust-resistant cultivars where available.",
    "powdery mildew": "Increase spacing and airflow; sulfur or potassium bicarbonate sprays can help on many crops.",
    "cercospora": "Rotate crops, remove debris, and use resistant varieties where available.",
    "gray leaf spot": "Rotate crops, remove debris, and use resistant varieties where available.",
    "common rust": "Plant resistant hybrids and remove heavily infected leaves to slow spread.",
    "northern leaf blight": "Use tolerant hybrids, rotate fields, and till under crop residue.",
    "esca": "There is no simple cure; maintain vine health, avoid trunk wounds, and seek viticulture advice.",
    "leaf blight": "Remove infected leaves, improve drainage, and apply appropriate fungicides if recommended locally.",
    "haunglongbing": "Citrus greening has no home cure; report suspect trees and follow regional quarantine programs.",
    "citrus greening": "Citrus greening has no home cure; report suspect trees and follow regional quarantine programs.",
    "bacterial spot": "Use disease-free seed/transplants, avoid working wet plants, and apply copper-based products if advised.",
    "early blight": "Mulch soil, stake plants for airflow, rotate beds, and remove lower infected leaves.",
    "late blight": "Act quickly: remove infected plants, avoid wet foliage, and use labeled fungicides in cool, wet weather.",
    "leaf scorch": "Ensure even watering, reduce heat stress, and remove severely damaged foliage.",
    "leaf mold": "Lower humidity in greenhouses, increase ventilation, and remove affected leaves.",
    "septoria": "Remove infected lower leaves, mulch, rotate crops, and apply fungicides if locally recommended.",
    "spider mite": "Spray plants with water to dislodge mites; insecticidal soap or horticultural oil may help.",
    "target spot": "Improve airflow, avoid leaf wetness, and remove heavily spotted leaves.",
    "yellow leaf curl": "Control whiteflies (vectors), remove infected plants, and use resistant varieties when possible.",
    "mosaic virus": "Remove infected plants, control aphids, and sanitize hands/tools between plants.",
}


_HEALTHY_CARE: dict[str, str] = {
    "default": (
        "Water at the base when soil is dry, provide balanced fertilizer during the growing season, "
        "and inspect leaves weekly for early disease signs."
    ),
    "tomato": "Stake or cage plants, mulch, water consistently, and rotate tomato beds each year.",
    "potato": "Hill soil around stems, avoid overwatering, and rotate potatoes to reduce blight risk.",
    "grape": "Prune for airflow, monitor canopy moisture, and remove mummified fruit.",
    "apple": "Prune for open canopy, scout for scab/rust early, and collect fallen leaves in autumn.",
    "corn": "Ensure adequate nitrogen and spacing; scout for rust and blight during humid periods.",
    "pepper": "Avoid overhead irrigation, provide full sun, and space plants for airflow.",
    "strawberry": "Use clean mulch, drip irrigate, and renew beds every few years.",
}


def get_advice(status: str, predicted_class: str, plant_name: str, condition: str) -> str:
    if status == "Uncertain":
        return (
            "Retake the photo with a plain background and sharper focus. "
            "If symptoms are visible, compare with reference images or consult a plant clinic."
        )
    if status == "Invalid or Uncertain":
        return (
            "Do not apply treatment based on this result. Capture a new photo of one leaf "
            "with natural lighting and minimal background clutter."
        )

    if status == "Healthy":
        key = plant_name.split()[0].lower()
        for name, tip in _HEALTHY_CARE.items():
            if name != "default" and name in plant_name.lower():
                return tip
        return _HEALTHY_CARE["default"]

    cond_lower = condition.lower()
    for keyword, tip in _DISEASE_ADVICE.items():
        if keyword in cond_lower:
            return tip

    return (
        f"Isolate affected plants if possible, remove severely damaged leaves, improve airflow, "
        f"and consult local agricultural extension services for treatment options specific to {condition} on {plant_name}."
    )
