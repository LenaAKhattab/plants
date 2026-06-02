import ResultPanel from "./ResultPanel.jsx";

export function CompactActionBar({ onUpload, onCamera, onReset, cameraOpen, loading }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={onUpload}
        disabled={loading}
        className="rounded-lg bg-leaf-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-leaf-900 disabled:opacity-40"
      >
        Upload new image
      </button>
      <button
        type="button"
        onClick={onCamera}
        disabled={loading}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
      >
        {cameraOpen ? "Close camera" : "Use camera"}
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={loading}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
      >
        Start over
      </button>
    </div>
  );
}

export function ImagePreview({ previewUrl, compact = false }) {
  if (compact) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sample image</p>
        </div>
        <div className="flex items-center justify-center bg-slate-50 p-3">
          {previewUrl ? (
            <img src={previewUrl} alt="Leaf sample" className="max-h-44 w-full rounded-lg object-contain" />
          ) : (
            <p className="py-8 text-center text-xs text-slate-400">No preview</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80">
      <div className="flex h-[clamp(120px,28vh,280px)] items-center justify-center p-3 sm:h-[clamp(140px,30vh,320px)] lg:h-[clamp(160px,32vh,360px)]">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Leaf preview"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-xl">
              🍃
            </div>
            <p className="text-xs text-slate-400 sm:text-sm">Your leaf preview will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadingState({ previewUrl }) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        {previewUrl && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <img src={previewUrl} alt="Analyzing" className="mx-auto max-h-40 object-contain" />
          </div>
        )}
        <div className="mx-auto flex h-12 w-12 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-700" />
        <p className="mt-5 font-display text-xl font-semibold text-leaf-900">Analyzing leaf sample</p>
        <p className="mt-2 text-sm text-slate-500 animate-pulse-soft">
          EfficientNetB0 is running inference on your image…
        </p>
      </div>
    </div>
  );
}

export function UploadHero({
  previewUrl,
  imageFile,
  cameraOpen,
  loading,
  error,
  videoRef,
  onUpload,
  onCamera,
  onCapture,
  onAnalyze,
}) {
  const tipsCard = (
    <div className="rounded-2xl border border-dashed border-leaf-200 bg-leaf-50/60 p-4 text-sm text-slate-600 lg:sticky lg:top-4">
      <p className="font-medium text-leaf-800">Tips for best results</p>
      <ul className="mt-2 space-y-1.5 text-left">
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-600" />
          One leaf, centered, good lighting
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-600" />
          Avoid blur, heavy shadows, and cluttered backgrounds
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-600" />
          Confidence below 60% is flagged as Uncertain
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-600" />
          Screenshots, logos, and non-leaf images are rejected automatically
        </li>
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col items-center px-4 py-4 sm:px-6 lg:py-5">
      <div className="w-full max-w-[1240px]">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-leaf-900 sm:text-3xl">
            Plant disease analysis
          </h1>
          <p className="mt-1.5 text-sm leading-snug text-slate-600 sm:text-base">
            Upload or capture a leaf photo for AI-powered disease classification.
          </p>
        </div>

        <div className="mt-4 grid items-start gap-4 lg:mt-5 lg:grid-cols-[minmax(260px,340px)_1fr] lg:gap-8">
          <div className="order-1 min-w-0 lg:order-2">
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Analyze a leaf sample
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onUpload}
                  className="rounded-xl bg-leaf-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-leaf-900"
                >
                  Upload image
                </button>
                <button
                  type="button"
                  onClick={onCamera}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {cameraOpen ? "Close camera" : "Use camera"}
                </button>
              </div>

              {cameraOpen && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-black">
                  <video
                    ref={videoRef}
                    className="aspect-video max-h-[220px] w-full object-cover sm:max-h-[260px]"
                    playsInline
                    muted
                  />
                  <div className="flex justify-center bg-slate-900 p-2">
                    <button
                      type="button"
                      onClick={onCapture}
                      className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900"
                    >
                      Capture photo
                    </button>
                  </div>
                </div>
              )}

              {!cameraOpen && (
                <div className="mt-3">
                  <ImagePreview previewUrl={previewUrl} />
                </div>
              )}

              <button
                type="button"
                onClick={onAnalyze}
                disabled={!imageFile || loading}
                className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Analyze leaf
              </button>
            </div>

            {error && (
              <div
                className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
                role="alert"
              >
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-1">{error}</p>
              </div>
            )}
          </div>

          {/* Tips: left on desktop, below upload on mobile */}
          <aside className="order-2 w-full lg:order-1 lg:max-w-[340px] lg:justify-self-start">
            {tipsCard}
          </aside>
        </div>
      </div>
    </div>
  );
}

export function ResultScreen({
  previewUrl,
  result,
  backendOk,
  inferenceMs,
  error,
  cameraOpen,
  loading,
  videoRef,
  onUpload,
  onCamera,
  onReset,
  onCapture,
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-5 space-y-4">
        <CompactActionBar
          onUpload={onUpload}
          onCamera={onCamera}
          onReset={onReset}
          cameraOpen={cameraOpen}
          loading={loading}
        />

        {cameraOpen && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-black lg:max-w-md">
            <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted />
            <div className="flex justify-center bg-slate-900 p-3">
              <button
                type="button"
                onClick={onCapture}
                className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900"
              >
                Capture photo
              </button>
            </div>
          </div>
        )}
      </div>

      {!cameraOpen && previewUrl && (
        <div className="mb-5 lg:hidden">
          <ImagePreview previewUrl={previewUrl} compact />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-8 xl:grid-cols-[240px_1fr]">
        {!cameraOpen && previewUrl && (
          <aside className="hidden lg:block">
            <ImagePreview previewUrl={previewUrl} compact />
          </aside>
        )}

        <div className="min-w-0 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1">{error}</p>
            </div>
          )}
          {result && !loading && (
            <ResultPanel result={result} backendOk={backendOk} inferenceMs={inferenceMs} />
          )}
        </div>
      </div>
    </div>
  );
}
