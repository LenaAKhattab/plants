import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LoadingState,
  ResultScreen,
  UploadHero,
} from "./components/UploadFlow.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/** idle | selected | analyzing | result */
function derivePhase({ loading, result, imageFile }) {
  if (loading) return "analyzing";
  if (result) return "result";
  if (imageFile) return "selected";
  return "idle";
}

export default function App() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [inferenceMs, setInferenceMs] = useState(null);
  const [backendOk, setBackendOk] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const phase = useMemo(
    () => derivePhase({ loading, result, imageFile }),
    [loading, result, imageFile]
  );

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then((data) => setBackendOk(data))
      .catch(() => setBackendOk({ status: "error", model_loaded: false }));
  }, []);

  const revokePreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  const resetAll = useCallback(() => {
    stopCamera();
    revokePreview();
    setPreviewUrl(null);
    setImageFile(null);
    setResult(null);
    setInferenceMs(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [revokePreview, stopCamera]);

  const setImageFromFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) {
        setError("Please select a valid image file (JPEG, PNG, WebP, or BMP).");
        return;
      }
      stopCamera();
      revokePreview();
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setInferenceMs(null);
      setError(null);
    },
    [revokePreview, stopCamera]
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImageFromFile(file);
  };

  const openUpload = () => fileInputRef.current?.click();

  const startCamera = async () => {
    setError(null);
    if (cameraOpen) {
      stopCamera();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setResult(null);
      setInferenceMs(null);
      revokePreview();
      setPreviewUrl(null);
      setImageFile(null);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    } catch {
      setError("Camera access denied or unavailable. Use file upload instead.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not capture photo. Try again.");
          return;
        }
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        stopCamera();
        setImageFromFile(file);
      },
      "image/jpeg",
      0.92
    );
  };

  const analyze = async () => {
    if (!imageFile) {
      setError("Upload or capture a leaf image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setInferenceMs(null);

    const formData = new FormData();
    formData.append("file", imageFile);
    const t0 = performance.now();

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        throw new Error(detail || `Server error (${res.status})`);
      }

      setInferenceMs(performance.now() - t0);
      setResult(data);
    } catch (err) {
      setError(err.message || "Prediction failed. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl, stopCamera]);

  const sharedFlowProps = {
    previewUrl,
    imageFile,
    cameraOpen,
    loading,
    error,
    videoRef,
    onUpload: openUpload,
    onCamera: startCamera,
    onCapture: capturePhoto,
    onAnalyze: analyze,
    onReset: resetAll,
  };

  return (
    <div className="min-h-screen bg-leaf-50/30">
      <header className="border-b border-leaf-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-700 text-lg text-white">
              🌿
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-leaf-900">LeafScan</p>
              <p className="text-xs text-slate-500">Plant Disease Classifier</p>
            </div>
          </div>
          {backendOk && (
            <div
              className={`hidden rounded-lg px-3 py-1.5 text-xs font-medium sm:block ${
                backendOk.model_loaded
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {backendOk.model_loaded
                ? `Model ready · ${backendOk.num_classes} classes`
                : "Model not loaded — add .keras file to backend/model"}
            </div>
          )}
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/bmp"
        className="hidden"
        onChange={handleFileChange}
      />

      <main>
        {(phase === "idle" || phase === "selected") && (
          <UploadHero {...sharedFlowProps} />
        )}

        {phase === "analyzing" && <LoadingState previewUrl={previewUrl} />}

        {phase === "result" && (
          <ResultScreen
            previewUrl={previewUrl}
            result={result}
            backendOk={backendOk}
            inferenceMs={inferenceMs}
            error={error}
            cameraOpen={cameraOpen}
            loading={loading}
            videoRef={videoRef}
            onUpload={openUpload}
            onCamera={startCamera}
            onReset={resetAll}
            onCapture={capturePhoto}
          />
        )}
      </main>

      <footer className="border-t border-leaf-100 py-5 text-center text-xs text-slate-400">
        Plant Disease Detection · EfficientNetB0 · TensorFlow/Keras
      </footer>
    </div>
  );
}
