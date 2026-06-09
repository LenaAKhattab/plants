# Class-Based Metadata Migration Report

**Phase:** 1 (initial)  
**Date:** 2026-06-09  
**Scope:** Frontend report content generation only — no backend or UI changes.

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/diseaseMetadata.js` | **New** — `CLASS_METADATA` map keyed by `predicted_class`; initial entries for Apple and Grape black rot |
| `frontend/src/resultContent.js` | **Updated** — primary lookup by `predicted_class`; legacy `matchProfile(condition)` retained as fallback with `console.warn` |
| `frontend/MIGRATION_REPORT.md` | **New** — this document |

### Unchanged

- `frontend/src/components/ResultPanel.jsx` — no edits (same section layout and styling)
- `frontend/src/components/UploadFlow.jsx`
- `frontend/src/App.jsx`
- All backend files (`app.py`, `advice.py`, `image_validation.py`, model files)
- `/predict` response structure

---

## New Metadata Structure

Each entry in `CLASS_METADATA` is keyed by the exact model class string from `backend/model/class_names.json`:

```javascript
{
  "Apple___Black_rot": {
    description: string,       // Section 01 — Diagnosis Summary
    symptoms: string[],        // Section 03 — Observed Symptoms
    prevention: string[],      // Section 05 — Prevention Tips
    defaultAction: string,     // Section 04 — fallback when backend advice absent
    diseaseType: string,       // Section 02 — Disease Facts
    spreadMethod: string,      // Section 02 — Disease Facts
    severityTier: "high" | "medium" | "low",  // Severity assessment
  }
}
```

**Section 04 (Recommended Actions)** uses backend `advice` when present; otherwise `defaultAction` from class metadata.

**Section 02 (Threat level)** is derived from `getSeverity()`, which reads `severityTier` from class metadata when available.

---

## Lookup Flow

```
/predict response
  └─► result.predicted_class  (e.g. "Apple___Black_rot")
        │
        ├─► getClassMetadata(predicted_class)
        │     │
        │     ├─► HIT  → use CLASS_METADATA entry for all report sections
        │     │
        │     └─► MISS → console.warn("[LeafScan] Missing class metadata …")
        │               └─► legacy matchProfile(result.condition)  [deprecated]
        │                     └─► still MISS → generic hardcoded fallback
        │
        ├─► buildResultSections()   → description, symptoms, prevention, actions
        ├─► getDiseaseFacts()       → diseaseType, spreadMethod, threatLevel
        └─► getSeverity()           → level, description (from severityTier)
```

**Healthy** and **Uncertain** statuses bypass class metadata (unchanged behavior).

---

## Classes Migrated (2 / 38)

| predicted_class | Crop | Notes |
|-----------------|------|-------|
| `Apple___Black_rot` | Apple | Apple-specific frogeye spots; **no grape symptoms** |
| `Grape___Black_rot` | Grape | Retains V-shaped yellowing and grape-specific copy |

---

## Remaining Classes to Migrate (36)

### Diseased (24)

| predicted_class |
|-----------------|
| `Apple___Apple_scab` |
| `Apple___Cedar_apple_rust` |
| `Cherry_(including_sour)___Powdery_mildew` |
| `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` |
| `Corn_(maize)___Common_rust_` |
| `Corn_(maize)___Northern_Leaf_Blight` |
| `Grape___Esca_(Black_Measles)` |
| `Grape___Leaf_blight_(Isariopsis_Leaf_Spot)` |
| `Orange___Haunglongbing_(Citrus_greening)` |
| `Peach___Bacterial_spot` |
| `Pepper,_bell___Bacterial_spot` |
| `Potato___Early_blight` |
| `Potato___Late_blight` |
| `Squash___Powdery_mildew` |
| `Strawberry___Leaf_scorch` |
| `Tomato___Bacterial_spot` |
| `Tomato___Early_blight` |
| `Tomato___Late_blight` |
| `Tomato___Leaf_Mold` |
| `Tomato___Septoria_leaf_spot` |
| `Tomato___Spider_mites Two-spotted_spider_mite` |
| `Tomato___Target_Spot` |
| `Tomato___Tomato_Yellow_Leaf_Curl_Virus` |
| `Tomato___Tomato_mosaic_virus` |

### Healthy (12)

| predicted_class |
|-----------------|
| `Apple___healthy` |
| `Blueberry___healthy` |
| `Cherry_(including_sour)___healthy` |
| `Corn_(maize)___healthy` |
| `Grape___healthy` |
| `Peach___healthy` |
| `Pepper,_bell___healthy` |
| `Potato___healthy` |
| `Raspberry___healthy` |
| `Soybean___healthy` |
| `Strawberry___healthy` |
| `Tomato___healthy` |

### Priority for Phase 2 (shared legacy profiles)

1. `Peach___Bacterial_spot`, `Pepper,_bell___Bacterial_spot`, `Tomato___Bacterial_spot`
2. `Potato___Early_blight`, `Tomato___Early_blight`
3. `Potato___Late_blight`, `Tomato___Late_blight`
4. `Cherry_(including_sour)___Powdery_mildew`, `Squash___Powdery_mildew`

---

## Verification

After deploying, confirm:

- [ ] `Apple___Black_rot` report shows frogeye leaf spots — **no** "grape" in symptoms
- [ ] `Grape___Black_rot` report still shows V-shaped yellowing
- [ ] Unmigrated classes log `[LeafScan] Missing class metadata` in browser console
- [ ] Unmigrated classes still render via legacy condition matching (no blank sections)
- [ ] UI layout and styling unchanged
