import { getClassMetadata } from "./diseaseMetadata";

export const MODEL_NAME = "EfficientNetB0";
export const MODEL_INPUT_SIZE = "160 × 160";

const DISEASE_PROFILES = [
  {
    keys: ["apple scab"],
    description:
      "Apple scab is a fungal disease caused by Venturia inaequalis. It affects leaves and fruit, reducing quality and tree vigor when left unmanaged.",
    symptoms: ["Olive-green to dark brown velvety spots on leaves", "Deformed or cracked fruit", "Premature leaf drop in severe cases"],
    prevention: ["Plant scab-resistant cultivars", "Rake and remove fallen leaves", "Prune for open canopy airflow"],
  },
  {
    keys: ["black rot"],
    description:
      "Black rot is a fungal disease that causes leaf lesions and fruit decay, common on apples and grapes in warm, humid conditions.",
    symptoms: ["Brown leaf spots expanding with dark borders", "Mummified fruit", "V-shaped yellowing on grape leaves"],
    prevention: ["Sanitize pruning tools", "Remove mummified fruit and infected wood", "Avoid prolonged leaf wetness"],
  },
  {
    keys: ["cedar apple rust"],
    description:
      "Cedar apple rust requires both apple and juniper hosts. Spores move between hosts and produce bright rust-colored leaf lesions on apples.",
    symptoms: ["Yellow-orange spots on upper leaf surface", "Cup-shaped rust structures underneath", "Premature defoliation when severe"],
    prevention: ["Remove nearby juniper if feasible", "Use resistant apple varieties", "Apply protective fungicides at bud break"],
  },
  {
    keys: ["powdery mildew"],
    description:
      "Powdery mildew is a fungal disease that forms white powdery patches on leaf surfaces, reducing photosynthesis and plant strength.",
    symptoms: ["White dusty coating on leaves", "Curled or stunted new growth", "Reduced flowering or fruit set"],
    prevention: ["Increase plant spacing", "Water at soil level", "Choose resistant cultivars"],
  },
  {
    keys: ["cercospora", "gray leaf spot"],
    description:
      "Gray leaf spot diseases produce rectangular or elongated gray-tan lesions, often affecting corn and other broadleaf crops.",
    symptoms: ["Gray-brown rectangular lesions parallel to veins", "Yellow halos around spots", "Lower leaves affected first"],
    prevention: ["Rotate crops annually", "Till under infected residue", "Use tolerant hybrids"],
  },
  {
    keys: ["common rust"],
    description:
      "Common rust is a fungal disease producing pustules on leaves, weakening plants and lowering yield in corn and similar crops.",
    symptoms: ["Reddish-brown pustules on both leaf sides", "Yellowing around pustules", "Stunted plants in heavy infections"],
    prevention: ["Plant rust-resistant hybrids", "Scout early in humid weather", "Remove heavily infected leaves"],
  },
  {
    keys: ["northern leaf blight"],
    description:
      "Northern leaf blight causes long elliptical gray-green lesions on corn leaves and can spread rapidly in cool, wet seasons.",
    symptoms: ["Cigar-shaped gray-green lesions", "Lesions merging on lower canopy", "Reduced grain fill when severe"],
    prevention: ["Rotate with non-host crops", "Bury crop residue", "Select resistant hybrids"],
  },
  {
    keys: ["esca", "black measles"],
    description:
      "Esca (Black Measles) is a complex grapevine trunk disease that causes leaf streaking and long-term vine decline.",
    symptoms: ["Interveinal leaf striping (tiger-stripe pattern)", "Partial leaf drying", "Slow vine decline over seasons"],
    prevention: ["Avoid trunk wounds", "Maintain balanced vine nutrition", "Remove severely affected vines"],
  },
  {
    keys: ["leaf blight", "isariopsis"],
    description:
      "Leaf blight diseases cause spreading necrotic lesions on foliage, often favored by prolonged moisture on leaves.",
    symptoms: ["Irregular brown leaf patches", "Yellowing margins around lesions", "Defoliation under heavy pressure"],
    prevention: ["Improve canopy airflow", "Irrigate early in the day", "Remove infected leaves promptly"],
  },
  {
    keys: ["haunglongbing", "citrus greening"],
    description:
      "Huanglongbing (citrus greening) is a serious bacterial disease spread by psyllids, causing misshapen fruit and tree decline.",
    symptoms: ["Asymmetric blotchy leaf mottling", "Small lopsided fruit", "Yellow shoots and branch dieback"],
    prevention: ["Control Asian citrus psyllid vectors", "Use certified disease-free nursery stock", "Report suspect trees to authorities"],
  },
  {
    keys: ["bacterial spot"],
    description:
      "Bacterial spot creates water-soaked lesions on leaves and fruit, thriving in warm, wet conditions and spreading via splash.",
    symptoms: ["Dark spots with yellow halos on leaves", "Raised scabby fruit lesions", "Leaf drop in severe infections"],
    prevention: ["Use pathogen-free seed and transplants", "Avoid working wet foliage", "Rotate susceptible crops"],
  },
  {
    keys: ["early blight"],
    description:
      "Early blight is a common fungal disease producing concentric ring spots, often starting on lower, older leaves.",
    symptoms: ["Dark spots with target-like rings", "Yellowing around lesions", "Lower leaf loss progressing upward"],
    prevention: ["Mulch to reduce soil splash", "Stake plants for airflow", "Rotate solanaceous crops"],
  },
  {
    keys: ["late blight"],
    description:
      "Late blight is a destructive oomycete disease that spreads quickly in cool, wet weather and can destroy crops within days.",
    symptoms: ["Large dark water-soaked leaf patches", "White fuzzy growth on undersides in humidity", "Rapid plant collapse"],
    prevention: ["Destroy volunteer plants and tubers", "Avoid overhead irrigation", "Apply protectant fungicides when risk is high"],
  },
  {
    keys: ["leaf scorch"],
    description:
      "Leaf scorch presents as browning along leaf margins or between veins, often linked to stress, pathogens, or environmental factors.",
    symptoms: ["Brown scorched leaf edges", "Progressive browning toward leaf center", "Dry, brittle affected tissue"],
    prevention: ["Maintain even soil moisture", "Mulch root zones", "Reduce heat and drought stress"],
  },
  {
    keys: ["leaf mold"],
    description:
      "Leaf mold affects tomato foliage in humid environments, forming olive-green spores on the underside of yellowing leaves.",
    symptoms: ["Yellow patches on upper leaf surface", "Olive-green fuzzy growth underneath", "Defoliation in greenhouses"],
    prevention: ["Increase ventilation", "Reduce humidity", "Remove infected lower leaves"],
  },
  {
    keys: ["septoria"],
    description:
      "Septoria leaf spot produces numerous small dark spots with light centers, typically beginning on lower tomato leaves.",
    symptoms: ["Small circular spots with gray centers", "Yellowing around spots", "Lower leaves dropping first"],
    prevention: ["Rotate planting beds", "Mulch soil surface", "Avoid overhead watering"],
  },
  {
    keys: ["spider mite"],
    description:
      "Two-spotted spider mites are tiny sap-feeding pests that cause stippling and webbing, often worsening in hot, dry conditions.",
    symptoms: ["Fine yellow stippling on leaves", "Bronzing of foliage", "Fine silk webbing on leaf undersides"],
    prevention: ["Maintain adequate humidity", "Spray plants with water to dislodge mites", "Monitor early before populations explode"],
  },
  {
    keys: ["target spot"],
    description:
      "Target spot is a fungal leaf disease producing circular lesions with concentric rings, reducing leaf area and yield.",
    symptoms: ["Brown circular spots with ring patterns", "Coalescing lesions on lower leaves", "Premature senescence"],
    prevention: ["Improve spacing and airflow", "Remove crop debris", "Rotate with non-host plants"],
  },
  {
    keys: ["yellow leaf curl"],
    description:
      "Tomato Yellow Leaf Curl Virus is spread by whiteflies and causes severe leaf curling, stunting, and yield loss.",
    symptoms: ["Upward leaf curling and cupping", "Reduced leaf size", "Stunted plant growth"],
    prevention: ["Control whitefly populations", "Use virus-resistant varieties", "Remove infected plants early"],
  },
  {
    keys: ["mosaic virus"],
    description:
      "Tomato mosaic virus causes mottled discoloration and distortion of leaves, spreading through contact and contaminated tools.",
    symptoms: ["Light and dark green mottling", "Leaf distortion or fern-like growth", "Reduced fruit quality"],
    prevention: ["Wash hands and tools between plants", "Remove infected plants", "Use certified virus-free seed"],
  },
];

const HEALTHY_PROFILES = {
  default: {
    description: (plant) =>
      `${plant} leaves in this image appear healthy with no strong disease signatures detected by the model.`,
    symptoms: ["Uniform green coloration", "No prominent necrotic or scab-like lesions", "Typical leaf shape for the species"],
    prevention: ["Inspect weekly for early spots or pests", "Water at the base and avoid wet foliage overnight", "Maintain balanced fertilization"],
  },
  tomato: {
    description: () =>
      "Tomato foliage appears healthy. Tomatoes are susceptible to blight and leaf spot — early monitoring keeps crops productive.",
    symptoms: ["Deep green leaves without major spotting", "No widespread yellowing or curling", "Normal leaf texture"],
    prevention: ["Stake or cage for airflow", "Mulch soil and rotate beds yearly", "Scout lower leaves after rain"],
  },
  potato: {
    description: () =>
      "Potato leaves appear healthy. Late blight risk rises in cool, wet periods — continue preventive scouting.",
    symptoms: ["Even green canopy", "No dark water-soaked patches", "No rapid wilt pattern"],
    prevention: ["Hill soil around stems", "Use certified seed potatoes", "Remove volunteer plants"],
  },
};

/** @deprecated Legacy condition-substring lookup — used only as fallback for unmigrated classes. */
function matchProfile(condition) {
  const lower = condition.toLowerCase();
  return DISEASE_PROFILES.find((p) => p.keys.some((k) => lower.includes(k)));
}

function getHealthyProfile(plantName) {
  const key = plantName.toLowerCase();
  for (const [name, profile] of Object.entries(HEALTHY_PROFILES)) {
    if (name !== "default" && key.includes(name)) return profile;
  }
  return HEALTHY_PROFILES.default;
}

function warnMissingClassMetadata(predictedClass, context) {
  console.warn(
    `[LeafScan] Missing class metadata for "${predictedClass ?? "(none)"}" in ${context}; using condition-based fallback.`,
  );
}

function sectionsFromMetadata(meta, advice) {
  return {
    description: meta.description,
    actions: [advice || meta.defaultAction || "Confirm diagnosis locally before applying chemical treatments."],
    symptoms: meta.symptoms,
    prevention: meta.prevention,
  };
}

export function buildResultSections(result) {
  const { plant_name, condition, status, advice, explanation, predicted_class } = result;

  if (status === "Uncertain") {
    return {
      description:
        explanation ||
        "The AI model could not reach a reliable confidence threshold for this image. Visual features may be ambiguous or the photo quality may limit classification.",
      actions: advice
        ? [advice]
        : [
            "Retake the photo with a single leaf centered in frame",
            "Use bright, even lighting and reduce motion blur",
            "Compare symptoms with the overview cards above before taking action",
          ],
      symptoms: [
        "Mixed visual cues that match multiple classes",
        "Possible occlusion, blur, or non-leaf background interference",
        "Low softmax confidence (below 60%)",
      ],
      prevention: [
        "Capture multiple angles if symptoms are subtle",
        "Document progression over several days",
        "Consult a local agronomist if physical symptoms worsen",
      ],
    };
  }

  if (status === "Healthy") {
    const profile = getHealthyProfile(plant_name);
    return {
      description: profile.description(plant_name),
      actions: advice ? [advice] : ["Continue routine monitoring and cultural care practices."],
      symptoms: profile.symptoms,
      prevention: profile.prevention,
    };
  }

  const classMeta = getClassMetadata(predicted_class);
  if (classMeta) {
    return sectionsFromMetadata(classMeta, advice);
  }

  warnMissingClassMetadata(predicted_class, "buildResultSections");

  const legacyProfile = matchProfile(condition);
  if (legacyProfile) {
    return {
      description: legacyProfile.description,
      actions: advice ? [advice] : ["Confirm diagnosis locally before applying chemical treatments."],
      symptoms: legacyProfile.symptoms,
      prevention: legacyProfile.prevention,
    };
  }

  return {
    description: explanation || `${plant_name} may be affected by ${condition} based on model analysis.`,
    actions: advice ? [advice] : ["Remove severely affected tissue and improve airflow around plants."],
    symptoms: [
      "Discoloration or spotting on leaf surface",
      "Irregular lesion shape or spreading margins",
      "Possible yellowing of surrounding tissue",
    ],
    prevention: [
      "Use resistant varieties when available",
      "Rotate crops and remove plant debris",
      "Avoid prolonged leaf wetness",
    ],
  };
}

const HIGH_SEVERITY_KEYS = [
  "late blight",
  "citrus greening",
  "haunglongbing",
  "yellow leaf curl",
  "mosaic virus",
  "esca",
  "black measles",
];

const MEDIUM_SEVERITY_KEYS = [
  "early blight",
  "bacterial spot",
  "septoria",
  "leaf blight",
  "black rot",
  "apple scab",
  "northern leaf blight",
  "target spot",
];

function inferDiseaseType(condition, status) {
  if (status === "Healthy") return "None detected";
  const c = condition.toLowerCase();
  if (c.includes("virus") || c.includes("mosaic") || c.includes("curl")) return "Viral";
  if (c.includes("bacterial")) return "Bacterial";
  if (c.includes("mite") || c.includes("spider")) return "Pest / mite";
  if (c.includes("scorch") || c.includes("mold")) return "Fungal / environmental";
  if (
    c.includes("blight") ||
    c.includes("scab") ||
    c.includes("rot") ||
    c.includes("mildew") ||
    c.includes("rust") ||
    c.includes("spot") ||
    c.includes("septoria")
  ) {
    return "Fungal";
  }
  return "Plant pathogen (unspecified)";
}

function inferSpreadMethod(diseaseType) {
  const map = {
    Fungal: "Airborne spores, rain splash, and contaminated tools",
    Bacterial: "Water splash, plant contact, and infected seed or transplants",
    Viral: "Insect vectors (aphids, whiteflies) and grafting or sap contact",
    "Pest / mite": "Direct colonization and wind-assisted dispersal",
    "Fungal / environmental": "Humidity-driven spores and stressed tissue entry",
    "None detected": "Not applicable — no active pathogen indicated",
    "Plant pathogen (unspecified)": "Contact, water splash, or environmental exposure",
  };
  return map[diseaseType] || map["Plant pathogen (unspecified)"];
}

function severityFromTier(tier, confidence) {
  const conf = confidence ?? 0;

  if (tier === "high") {
    return {
      level: conf >= 65 ? "High" : "Medium",
      description: "This condition can spread rapidly and may cause significant crop loss if untreated.",
    };
  }
  if (tier === "medium") {
    return {
      level: conf >= 75 ? "Medium" : "Low",
      description: "Moderate agronomic impact — early intervention is recommended.",
    };
  }
  return {
    level: conf >= 80 ? "Medium" : "Low",
    description: "Localized symptoms — monitor closely and confirm in the field.",
  };
}

function severityFromCondition(condition, confidence) {
  const cond = condition.toLowerCase();
  const conf = confidence ?? 0;

  if (HIGH_SEVERITY_KEYS.some((k) => cond.includes(k))) {
    return {
      level: conf >= 65 ? "High" : "Medium",
      description: "This condition can spread rapidly and may cause significant crop loss if untreated.",
    };
  }
  if (MEDIUM_SEVERITY_KEYS.some((k) => cond.includes(k))) {
    return {
      level: conf >= 75 ? "Medium" : "Low",
      description: "Moderate agronomic impact — early intervention is recommended.",
    };
  }
  return {
    level: conf >= 80 ? "Medium" : "Low",
    description: "Localized symptoms — monitor closely and confirm in the field.",
  };
}

export function getDiseaseFacts(result) {
  const classMeta = getClassMetadata(result.predicted_class);

  let diseaseType;
  let spreadMethod;

  if (classMeta) {
    diseaseType = classMeta.diseaseType;
    spreadMethod = classMeta.spreadMethod ?? inferSpreadMethod(classMeta.diseaseType);
  } else {
    if (result.status === "Diseased") {
      warnMissingClassMetadata(result.predicted_class, "getDiseaseFacts");
    }
    diseaseType = inferDiseaseType(result.condition, result.status);
    spreadMethod = inferSpreadMethod(diseaseType);
  }

  const threatLevel = getSeverity(result).level;
  return {
    diseaseType,
    affectedPlant: result.plant_name,
    spreadMethod,
    threatLevel: result.status === "Healthy" ? "Minimal" : threatLevel,
  };
}

export function getSeverity(result) {
  if (result.status === "Healthy") {
    return {
      level: "Low",
      description: "No significant disease indicators detected in this sample.",
    };
  }

  const classMeta = getClassMetadata(result.predicted_class);
  if (classMeta?.severityTier) {
    return severityFromTier(classMeta.severityTier, result.confidence);
  }

  if (result.status === "Diseased") {
    warnMissingClassMetadata(result.predicted_class, "getSeverity");
  }

  return severityFromCondition(result.condition, result.confidence);
}

export function getConfidenceExplanation(confidence, status) {
  if (status === "Healthy") {
    if (confidence >= 90) return "Strong visual alignment with healthy reference patterns in the training set.";
    if (confidence >= 75) return "Good match to healthy leaf morphology with consistent color and texture cues.";
    return "Moderate confidence — leaf appears healthy but verify for early subtle symptoms.";
  }
  if (confidence >= 90) return "Very strong pattern match — lesion features closely resemble the predicted class.";
  if (confidence >= 75) return "Reliable classification — visual markers align well with model training data.";
  if (confidence >= 60) return "Acceptable match — consider field confirmation before treatment.";
  return "Low softmax score — treat as preliminary only.";
}
