# Plant Disease Detection Web App

Graduation project demo: classify plant leaf images with an **EfficientNetB0** model trained in `plants.ipynb`, served through a **FastAPI** backend and a single-page **React + Vite + Tailwind** frontend.

## Project structure

```
Plants model/
├── backend/
│   ├── app.py                 # FastAPI server + /predict endpoint
│   ├── advice.py              # Explanations and care/treatment text
│   ├── requirements.txt
│   └── model/
│       ├── plant_disease_efficientnet_model.keras   # YOU provide this
│       ├── class_names.json                         # 38 classes (included)
│       └── model_metadata.json                      # image size, rules (included)
├── frontend/                  # React single-page UI
└── README.md
```

## 1. Add your trained model files

After running **section 17** of `plants.ipynb`, copy these into `backend/model/`:

| File | Required |
|------|----------|
| `plant_disease_efficientnet_model.keras` | **Yes** |
| `class_names.json` | Yes (already copied from your export) |
| `model_metadata.json` | Optional (defaults: 224×224, 60% threshold) |

The backend loads the Keras model **once at startup** and uses the same logic as the notebook:

- Resize to **224×224**
- Predict with softmax
- **Uncertain** if confidence &lt; **60%**
- **Healthy** if the part after `___` equals `healthy`, else **Diseased**
- Return top **3** alternatives

## 2. Run the backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) should show `"model_loaded": true` when the `.keras` file is present.

API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## 3. Run the frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

Optional: set a custom API URL in `frontend/.env`:

```
VITE_API_URL=http://127.0.0.1:8000
```

## Usage

1. **Upload** a leaf image or **Use camera** to capture one.
2. Preview the image on the right.
3. Click **Analyze leaf** — results show status, confidence, top-3 classes, explanation, and care/treatment advice.

## API — `POST /predict`

**Request:** `multipart/form-data` with field `file` (JPEG, PNG, WebP, BMP)

**Response example:**

```json
{
  "status": "Diseased",
  "predicted_class": "Tomato___Late_blight",
  "plant_name": "Tomato",
  "condition": "Late blight",
  "confidence": 92.4,
  "top_k": [
    { "rank": 1, "predicted_class": "Tomato___Late_blight", "confidence": 92.4, "status": "Diseased" }
  ],
  "advice": "...",
  "explanation": "..."
}
```

## Notes

- This app **does not retrain** the model.
- Class names come from `class_names.json` — do not edit them manually unless re-exporting from the notebook.
- First TensorFlow import can take a minute; subsequent predictions are faster.
- For demo on a phone, use HTTPS or localhost tunneling if the camera API requires a secure context.

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Vite 6, Tailwind CSS 3 |
| Backend | FastAPI, Uvicorn |
| ML | TensorFlow/Keras, EfficientNetB0, Pillow, NumPy |
