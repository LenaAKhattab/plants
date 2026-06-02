import {
  buildResultSections,
  getConfidenceExplanation,
  getDiseaseFacts,
  getSeverity,
  MODEL_INPUT_SIZE,
  MODEL_NAME,
} from "../resultContent";

const STATUS_STYLES = {
  Healthy: { accent: "border-emerald-300", bar: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-200" },
  Diseased: { accent: "border-rose-300", bar: "bg-rose-500", text: "text-rose-700", ring: "ring-rose-200" },
  Uncertain: { accent: "border-amber-300", bar: "bg-amber-500", text: "text-amber-800", ring: "ring-amber-200" },
  "Invalid image": { accent: "border-orange-300", bar: "bg-orange-500", text: "text-orange-800", ring: "ring-orange-200" },
};

const SEVERITY_COLORS = {
  Low: { active: "bg-emerald-500", text: "text-emerald-800", bg: "bg-emerald-50" },
  Medium: { active: "bg-amber-500", text: "text-amber-900", bg: "bg-amber-50" },
  High: { active: "bg-rose-500", text: "text-rose-800", bg: "bg-rose-50" },
};

function StatusBadge({ status }) {
  const styles = {
    Healthy: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    Diseased: "bg-rose-100 text-rose-800 ring-rose-200",
    Uncertain: "bg-amber-100 text-amber-900 ring-amber-200",
    "Invalid image": "bg-orange-100 text-orange-900 ring-orange-200",
  };
  const dots = {
    Healthy: "bg-emerald-500",
    Diseased: "bg-rose-500",
    Uncertain: "bg-amber-500",
    "Invalid image": "bg-orange-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${styles[status] || styles.Uncertain}`}
    >
      <span className={`h-2 w-2 rounded-full ${dots[status] || dots.Uncertain}`} />
      {status}
    </span>
  );
}

function InfoCard({ icon, title, children, variant = "default" }) {
  const variants = {
    default: "border-slate-200 bg-white",
    action: "border-leaf-200 bg-leaf-50/40",
    alert: "border-amber-200 bg-amber-50/50",
  };
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${variants[variant]}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-base" aria-hidden>
          {icon}
        </span>
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      </div>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Accordion({ title, subtitle, children, variant = "default" }) {
  const styles =
    variant === "technical"
      ? "border-slate-300 bg-slate-50/80"
      : "border-slate-200 bg-white shadow-sm";
  return (
    <details className={`group overflow-hidden rounded-lg border ${styles}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 marker:content-none hover:bg-white/60">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="border-t border-slate-200/80 bg-white px-4 py-3">{children}</div>
    </details>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`text-right text-sm text-slate-800 ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
    </div>
  );
}

function ReportSection({ number, title, children }) {
  return (
    <section className="border-t border-slate-200/90 pt-6 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-mono text-xs font-semibold text-leaf-700">{number}</span>
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-800">{title}</h4>
      </div>
      {children}
    </section>
  );
}

function SymptomChips({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs leading-snug text-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SeverityIndicator({ level, description }) {
  const levels = ["Low", "Medium", "High"];
  const colors = SEVERITY_COLORS[level] || SEVERITY_COLORS.Low;
  const activeIdx = levels.indexOf(level);

  return (
    <div className={`rounded-lg border border-slate-200 ${colors.bg} px-4 py-3`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Severity assessment</p>
        <span className={`text-sm font-bold ${colors.text}`}>{level}</span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {levels.map((l, i) => (
          <div key={l} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                i <= activeIdx ? SEVERITY_COLORS[l].active : "bg-slate-200"
              }`}
            />
            <p className={`mt-1 text-center text-[10px] font-medium ${i === activeIdx ? colors.text : "text-slate-400"}`}>
              {l}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function FactGrid({ facts }) {
  const rows = [
    ["Disease type", facts.diseaseType],
    ["Affected plant", facts.affectedPlant],
    ["Spread method", facts.spreadMethod],
    ["Threat level", facts.threatLevel],
  ];
  return (
    <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/50">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className="text-sm leading-snug text-slate-800">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function TechnicalAccordion({ result, backendOk, inferenceMs }) {
  const numClasses = backendOk?.num_classes ?? "—";
  const inferenceLabel =
    inferenceMs != null
      ? `${inferenceMs < 1000 ? `${Math.round(inferenceMs)} ms` : `${(inferenceMs / 1000).toFixed(2)} s`}`
      : "—";
  const rank = result.top_k?.[0]?.rank ?? 1;

  return (
    <Accordion title="Detection details" subtitle="Inference pipeline · read-only telemetry" variant="technical">
      <div>
        <DetailRow label="Model" value={MODEL_NAME} mono />
        <DetailRow label="Input size" value={MODEL_INPUT_SIZE} mono />
        <DetailRow label="Class count" value={String(numClasses)} mono />
        <DetailRow label="Inference time" value={inferenceLabel} mono />
        <DetailRow label="Prediction rank" value={`#${rank} (top-1)`} mono />
        <DetailRow label="Class ID" value={result.predicted_class || "—"} mono />
      </div>
    </Accordion>
  );
}

const INVALID_TIPS = [
  "Upload one clear leaf filling most of the frame",
  "Use natural daylight or even indoor lighting",
  "Avoid screenshots, logos, cartoons, and UI images",
  "Keep the leaf centered with minimal background clutter",
];

function PanelWrapper({ children }) {
  return <div className="space-y-3">{children}</div>;
}

function InvalidImagePanel({ result }) {
  return (
    <PanelWrapper>
      <div className="space-y-4 rounded-2xl border-2 border-orange-300 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Input validation</p>
            <h3 className="mt-1 font-display text-2xl font-bold text-slate-900">Invalid image</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This does not look like a plant leaf image.
            </p>
          </div>
          <StatusBadge status="Invalid image" />
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
          <p className="text-sm font-medium text-orange-900">Why was this rejected?</p>
          <p className="mt-2 text-sm leading-relaxed text-orange-950/80">
            {result.advice ||
              "Our safety filter detected that this photo is likely not a natural leaf. No disease diagnosis was performed."}
          </p>
        </div>

        <InfoCard icon="💡" title="How to get a valid result" variant="alert">
          <BulletList items={INVALID_TIPS} />
        </InfoCard>
      </div>
    </PanelWrapper>
  );
}

function UncertainPanel({ result, backendOk, inferenceMs }) {
  return (
    <PanelWrapper>
      <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Report · Inconclusive
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold text-slate-900">Uncertain result</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              The model could not confidently classify this leaf. No definitive Healthy or Diseased diagnosis is issued.
            </p>
          </div>
          <StatusBadge status={result.status} />
        </div>

        {result.confidence > 0 && (
          <div className="flex items-end gap-4 border-b border-slate-100 pb-4">
            <p className="font-display text-4xl font-bold tabular-nums text-amber-800">{result.confidence}%</p>
            <p className="pb-1 text-sm text-slate-600">Best-match confidence — below reliable threshold</p>
          </div>
        )}

        <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3">
          <p className="text-sm leading-relaxed text-amber-950">
            {result.explanation ||
              "Please upload a sharper photo of a single leaf with better lighting and less blur."}
          </p>
          {result.advice && <p className="mt-2 text-sm text-amber-900/80">{result.advice}</p>}
        </div>

        <InfoCard icon="📷" title="Tips for a clearer photo" variant="alert">
          <BulletList items={INVALID_TIPS} />
        </InfoCard>

        <TechnicalAccordion result={result} backendOk={backendOk} inferenceMs={inferenceMs} />
      </div>
    </PanelWrapper>
  );
}

function DiagnosisPanel({ result, backendOk, inferenceMs }) {
  const statusStyle = STATUS_STYLES[result.status] || STATUS_STYLES.Uncertain;
  const sections = buildResultSections(result);
  const facts = getDiseaseFacts(result);
  const severity = getSeverity(result);
  const confidenceNote = getConfidenceExplanation(result.confidence, result.status);
  const reportId = `LS-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  return (
    <PanelWrapper>
      <article
        className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${statusStyle.accent}`}
      >
        {/* Report header */}
        <header className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                LeafScan Diagnostic Report · {reportId}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                {result.plant_name}
              </h3>
              <p className="mt-1 text-base text-slate-600">{result.condition}</p>
            </div>
            <StatusBadge status={result.status} />
          </div>

          {/* Confidence hero */}
          <div className="mt-6 flex flex-col gap-4 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI confidence score</p>
              <p className={`mt-1 font-display text-5xl font-bold tabular-nums ${statusStyle.text}`}>
                {result.confidence}
                <span className="text-2xl font-semibold">%</span>
              </p>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-600">{confidenceNote}</p>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${statusStyle.bar}`}
              style={{ width: `${Math.min(result.confidence, 100)}%` }}
            />
          </div>
        </header>

        {/* Report body */}
        <div className="space-y-0 px-5 py-6 sm:px-6">
          <ReportSection number="01" title="Diagnosis summary">
            <p className="text-sm leading-relaxed text-slate-700">{sections.description}</p>
          </ReportSection>

          <div className="mt-6">
            <SeverityIndicator level={severity.level} description={severity.description} />
          </div>

          <ReportSection number="02" title="Disease facts">
            <FactGrid facts={facts} />
          </ReportSection>

          <ReportSection number="03" title="Observed symptoms">
            <SymptomChips items={sections.symptoms} />
          </ReportSection>

          <ReportSection number="04" title="Recommended actions">
            <ul className="space-y-2">
              {sections.actions.map((action) => (
                <li key={action} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-600" aria-hidden />
                  {action}
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection number="05" title="Prevention tips">
            <ul className="space-y-2">
              {sections.prevention.map((tip) => (
                <li key={tip} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                  <span className="mt-2 h-px w-3 shrink-0 bg-leaf-600" aria-hidden />
                  {tip}
                </li>
              ))}
            </ul>
          </ReportSection>

          <div className="mt-8 border-t border-slate-200 pt-5">
            <TechnicalAccordion result={result} backendOk={backendOk} inferenceMs={inferenceMs} />
          </div>
        </div>
      </article>
    </PanelWrapper>
  );
}

export default function ResultPanel({ result, backendOk, inferenceMs }) {
  if (result.status === "Invalid image" || result.is_valid_leaf_image === false) {
    return <InvalidImagePanel result={result} />;
  }

  if (result.status === "Uncertain") {
    return <UncertainPanel result={result} backendOk={backendOk} inferenceMs={inferenceMs} />;
  }

  return <DiagnosisPanel result={result} backendOk={backendOk} inferenceMs={inferenceMs} />;
}
