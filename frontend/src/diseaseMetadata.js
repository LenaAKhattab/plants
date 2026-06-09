/**
 * Per-class disease report metadata keyed by exact model class names
 * (must match backend/model/class_names.json entries).
 *
 * Migrated classes use this map; all others fall back to condition-based
 * profiles in resultContent.js until migrated.
 */

export const CLASS_METADATA = {
  Apple___Black_rot: {
    description:
      "Apple black rot is a fungal disease caused by Botryosphaeria species. It causes frogeye leaf spots, limb cankers, and fruit decay on apple trees in warm, humid seasons.",
    symptoms: [
      "Circular frogeye leaf spots with tan centers and dark purple-brown borders",
      "Sunken brown lesions on fruit that expand into black rot",
      "Mummified fruit remaining on branches or the orchard floor",
    ],
    prevention: [
      "Prune out dead wood and cankers during dormant season",
      "Remove mummified fruit and fallen infected leaves",
      "Sanitize pruning tools between cuts",
    ],
    defaultAction: "Confirm diagnosis locally before applying chemical treatments.",
    diseaseType: "Fungal",
    spreadMethod: "Airborne spores, rain splash, and infected pruning wounds",
    severityTier: "medium",
  },

  Grape___Black_rot: {
    description:
      "Grape black rot is a fungal disease caused by Guignardia bidwellii. It affects grape leaves and fruit, spreading rapidly in warm, wet weather.",
    symptoms: [
      "Brown leaf spots expanding with dark borders",
      "V-shaped yellowing on grape leaves",
      "Mummified fruit shriveling to hard black mummies",
    ],
    prevention: [
      "Sanitize pruning tools between vines",
      "Remove mummified fruit and infected canes",
      "Avoid prolonged leaf wetness in the canopy",
    ],
    defaultAction: "Confirm diagnosis locally before applying chemical treatments.",
    diseaseType: "Fungal",
    spreadMethod: "Airborne ascospores, rain splash, and overwintered mummified fruit",
    severityTier: "medium",
  },
};

export function getClassMetadata(predictedClass) {
  if (!predictedClass) return null;
  return CLASS_METADATA[predictedClass] ?? null;
}
