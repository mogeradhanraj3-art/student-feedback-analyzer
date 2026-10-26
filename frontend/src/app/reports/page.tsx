"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileJson, FileSpreadsheet, Gauge, RefreshCw, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeading, Panel, MetricCard, EmptyState } from "@/components/ui";

type DashboardData = {
  total: number;
  avg_confidence?: number;
  negative_pct?: number;
  high_urgency?: number;
  sentiment_counts?: Record<string, number>;
};
type ModelData = {
  name?: string;
  selected_classifier?: string;
  training_rows?: number;
  classes?: string[];
  trained?: boolean;
  data_note?: string;
  evaluation?: {
    holdout_accuracy?: number;
    holdout_macro_f1?: number;
    holdout_rows?: number;
    warning?: string;
  };
  data_note?: string;
};

const readiness = [
  ["Replace synthetic seed data", "Train and evaluate on consented, representative student feedback."],
  ["Validate model quality", "Report macro-F1, per-class scores, a confusion matrix, and subgroup checks."],
  ["Lock down access", "Add authentication, roles, audit logs, rate limits, and secure secrets."],
  ["Set data governance", "Define retention, deletion, consent, and access policies."],
  ["Keep humans in control", "Require human review for decisions that affect people."],
] as const;

export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [model, setModel] = useState<ModelData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"csv" | "json" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboard, modelInfo] = await Promise.all([api.dashboard(), api.model()]);
      setData(dashboard as DashboardData);
      setModel(modelInfo as ModelData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load report data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveBlob = (blob: Blob, filename: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Give the browser time to begin the download before releasing the object URL.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  const downloadJson = async () => {
    if (!data || !model) return;
    setExporting("json");
    setError("");
    try {
      const report = {
        report: "student-feedback-analyzer",
        generated_at: new Date().toISOString(),
        dashboard: data,
        model,
        note: "Model evaluation uses the bundled synthetic dataset and is not a real-world performance claim.",
      };
      saveBlob(new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" }), "student-feedback-report.json");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create the JSON report.");
    } finally {
      setExporting(null);
    }
  };

  const downloadCsv = async () => {
    setExporting("csv");
    setError("");
    try {
      const blob = await api.exportCsv();
      saveBlob(blob, "student-feedback-report.csv");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not download the CSV report.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <motion.div
      className="reports-page"
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <PageHeading
        eyebrow="Reports studio / 05"
        title={<>Make the signal<br /><span className="text-acid">ready for action.</span></>}
        description="Export the feedback ledger, inspect model metadata, and keep the methodology visible alongside the numbers."
        action={<button className="btn btn-ghost" onClick={() => void load()} disabled={loading}><RefreshCw size={14} className={loading ? "animate-spin" : ""} />{loading ? "Refreshing…" : "Refresh data"}</button>}
      />

      {error && (
        <motion.div className="error-box report-error" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <AlertTriangle size={17} />
          <div><strong>We couldn't complete that request.</strong><span>{error}</span><button className="report-retry" onClick={() => void load()}>Try loading again</button></div>
        </motion.div>
      )}

      <motion.section className="report-hero" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.42 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 13 }}><span className="eyebrow-line" /> REPORTS STUDIO</div>
          <h2>Evidence first. Conclusions second.</h2>
          <p>Export the analyzed feedback ledger or a snapshot of the dashboard and model card. Each export keeps the limitations of the current model visible.</p>
          <div className="report-actions">
            <button className="btn btn-primary" onClick={() => void downloadCsv()} disabled={exporting !== null}>
              <FileSpreadsheet size={15} /> {exporting === "csv" ? "Preparing CSV…" : "Download feedback CSV"}
            </button>
            <button className="btn btn-ghost" onClick={() => void downloadJson()} disabled={!data || !model || exporting !== null}>
              <FileJson size={15} /> {exporting === "json" ? "Preparing JSON…" : "Export dashboard JSON"}
            </button>
          </div>
          <div className="report-status"><span className={`report-status-dot ${error ? "is-error" : loading ? "is-loading" : ""}`} />{loading ? "SYNCING REPORT DATA" : error ? "CHECK CONNECTION" : "REPORT DATA LOADED"}</div>
        </div>
        <motion.div className="report-mark" animate={{ y: [0, -5, 0], rotate: [0, 2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}><Download size={29} /></motion.div>
      </motion.section>

      <div className="grid metrics-grid">
        <MetricCard label="ROWS IN LEDGER" value={loading ? "…" : data?.total ?? "—"} caption="Stored analyzed responses" icon={FileSpreadsheet} index={0} />
        <MetricCard label="AVG. MODEL CONFIDENCE" value={data ? `${Math.round((data.avg_confidence ?? 0) * 100)}%` : "—"} caption="Not a calibrated certainty score" icon={Gauge} index={1} />
        <MetricCard label="MODEL FAMILY" value={model?.selected_classifier || (model?.name ? model.name.replace("TF-IDF + ", "") : "—")} caption="Current inference classifier" icon={RefreshCw} index={2} />
        <MetricCard label="PRIVACY SIGNAL" value="BASIC" caption="Redaction is not full privacy protection" icon={ShieldCheck} index={3} />
      </div>

      <div className="grid dashboard-bottom-grid report-panels">
        <Panel title="Model card" subtitle="What is currently powering the predictions">
          {model ? (
            <div className="report-model-grid">
              {([
                ["Model", model.name || "Not reported"],
                ["Training rows", model.training_rows ?? "Not reported"],
                ["Classes", model.classes?.join(", ") || "Not reported"],
                ["Training status", model.trained ? "Trained" : "Not trained"],
              ] as const).map(([label, value], index) => (
                <motion.div className="report-model-cell" key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + index * 0.05 }}>
                  <span>{label}</span><strong>{String(value)}</strong>
                </motion.div>
              ))}
              {model.evaluation && (
                <div className="callout report-evaluation" style={{ gridColumn: "1 / -1" }}>
                  <strong>Holdout evaluation</strong><br />
                  Accuracy: {model.evaluation.holdout_accuracy ?? "n/a"} · Macro-F1: {model.evaluation.holdout_macro_f1 ?? "n/a"} · Holdout rows: {model.evaluation.holdout_rows ?? "n/a"}<br />
                  {model.evaluation.warning || model.data_note || "Metrics require validation on representative data."}
                </div>
              )}
            </div>
          ) : <EmptyState title={loading ? "Loading model card" : "Model card unavailable"} detail={loading ? "Connecting to the student-feedback-analyzer API…" : "Check that the backend is running, then refresh this page."} />}
        </Panel>

        <Panel title="Before you publish" subtitle="Deployment readiness checklist">
          <div className="report-checklist">{readiness.map(([title, detail], index) => (
            <motion.div className="report-check-item" key={title} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + index * 0.06 }}>
              <span className="report-check-number">{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{title}</strong><p>{detail}</p></div>
            </motion.div>
          ))}</div>
        </Panel>
      </div>

      <Panel title="Interpretation note" subtitle="Decision support, not an automated decision-maker">
        <div className="callout report-interpretation"><CheckCircle2 size={17} /><p><strong>Keep the evidence attached to every conclusion.</strong><br />The bundled training data is synthetic and small. Its scores are a pipeline smoke test, not evidence of real-world performance. Replace the seed dataset, document annotation quality, test domain shift, and ask relevant stakeholders to review the system before real use.</p></div>
      </Panel>
    </motion.div>
  );
}
