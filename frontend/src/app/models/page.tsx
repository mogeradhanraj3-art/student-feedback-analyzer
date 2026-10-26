"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  FlaskConical,
  Gauge,
  GitCompareArrows,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { EmptyState, PageHeading, Panel } from "@/components/ui";

type ModelComparison = {
  name: string;
  macro_f1?: number;
  macro_precision?: number;
  macro_recall?: number;
  accuracy?: number;
  class_order?: string[];
};

type ModelResponse = {
  comparison?: ModelComparison[];
  selected_classifier?: string;
  name?: string;
  training_rows?: number;
  evaluation?: { holdout_rows?: number };
};

const modelNotes: Record<string, { tagline: string; best: string; tradeoff: string }> = {
  "Multinomial Naive Bayes": {
    tagline: "Fast probabilistic baseline",
    best: "A strong first model for sparse word features and small text datasets.",
    tradeoff: "Its conditional-independence assumption is simplistic. TF-IDF is supported, while raw counts are the classic formulation.",
  },
  "Complement Naive Bayes": {
    tagline: "Text baseline for uneven classes",
    best: "Designed to improve the Naive Bayes baseline when class frequencies are imbalanced.",
    tradeoff: "It still relies on Naive Bayes assumptions and must be evaluated on representative data.",
  },
  "Logistic Regression": {
    tagline: "Strong linear benchmark",
    best: "A dependable sparse-text baseline with interpretable feature weights.",
    tradeoff: "Linear decision boundaries cannot capture every contextual language pattern.",
  },
};

function MetricBar({ label, value = 0, index }: { label: string; value?: number; index: number }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  const pct = safeValue * 100;

  return (
    <div className="model-metric-row">
      <div className="model-metric-label">
        <span>{label}</span>
        <strong>{pct.toFixed(1)}%</strong>
      </div>
      <div className="model-track">
        <motion.div
          className="model-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.85, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default function ModelLabPage() {
  const [model, setModel] = useState<ModelResponse | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = (await api.model()) as ModelResponse;
      setModel(result);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load model benchmark.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const comparisons = model?.comparison ?? [];
  const winner = model?.selected_classifier;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <PageHeading
        eyebrow="Research workspace / 06"
        title={<>Choose the model.<br /><span className="text-acid">Prove it with data.</span></>}
        description="student-feedback-analyzer's model lab compares classic NLP baselines using the same holdout split, then selects a candidate by macro-F1. The benchmark is transparent about its limitations."
        action={
          <button className="btn btn-ghost" onClick={() => void load()} disabled={refreshing}>
            <Activity size={14} />
            {refreshing ? "Refreshing…" : "Refresh benchmark"}
          </button>
        }
      />

      {error && (
        <div className="error-box" role="alert">
          {error}. Start the FastAPI backend and try again.
          <button className="btn btn-ghost" onClick={() => void load()} disabled={refreshing}>Retry</button>
        </div>
      )}

      <section className="model-hero">
        <div className="model-hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> STUDENT FEEDBACK ANALYZER / MODEL LAB / BASELINE EXPERIMENT</div>
          <h2>Three algorithms.<br /><span>One fair comparison.</span></h2>
          <p>TF-IDF turns feedback into sparse text features. Three candidate classifiers learn from the same training split. Macro-F1 is the primary selection metric so each sentiment class contributes equally.</p>
          <div className="model-hero-chips">
            <span><FlaskConical size={13} /> 75 / 25 stratified split</span>
            <span><GitCompareArrows size={13} /> Shared feature pipeline</span>
            <span><Gauge size={13} /> Macro-F1 selection</span>
          </div>
        </div>
        <div className="model-visual" aria-label="Animated model signal visualization">
          <motion.div className="model-orbit orbit-one" animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }} />
          <motion.div className="model-orbit orbit-two" animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
          <motion.div className="model-core" animate={{ scale: [1, 1.045, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <BrainCircuit size={34} /><small>TF-IDF</small>
          </motion.div>
          {Array.from({ length: 9 }, (_, i) => (
            <motion.i
              key={i}
              className={`model-node node-${i + 1}`}
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.15, 0.8] }}
              transition={{ duration: 1.8 + (i % 3) * 0.5, delay: i * 0.14, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          <div className="model-visual-label">FEATURE SPACE <span>LIVE</span></div>
        </div>
      </section>

      <div className="model-method-grid">
        <Panel title="Experiment protocol" subtitle="Same data, same split, comparable metrics">
          <div className="model-protocol-list">
            {[
              ["01", "Vectorize", "TF-IDF · unigrams + bigrams"],
              ["02", "Split", "Stratified 75/25 · random_state 42"],
              ["03", "Train", "MNB · ComplementNB · Logistic Regression"],
              ["04", "Evaluate", "Accuracy · macro precision/recall/F1"],
              ["05", "Select", "Highest macro-F1, then recall, then accuracy"],
            ].map(([number, title, detail], index) => (
              <motion.div
                className="model-protocol-item"
                key={number}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 }}
              >
                <span>{number}</span>
                <div><strong>{title}</strong><small>{detail}</small></div>
                <CheckCircle2 size={15} />
              </motion.div>
            ))}
          </div>
        </Panel>

        <Panel title="Why macro-F1?" subtitle="A more balanced selection signal">
          <div className="macro-equation"><span>F1</span><b>=</b><span>2 × precision × recall</span><b>/</b><span>precision + recall</span></div>
          <p className="model-explainer">Macro-F1 calculates F1 for each class, then averages the class scores equally. That makes it useful when positive, neutral, and negative examples are not equally represented.</p>
          <div className="model-warning">
            <ShieldAlert size={17} />
            <p><strong>Research integrity check</strong><br />The bundled dataset is synthetic and small. Its scores are a pipeline smoke test, not evidence of real-world performance. Use real, consented, human-labeled feedback before claiming accuracy.</p>
          </div>
        </Panel>
      </div>

      <div className="model-section-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> EXPERIMENT RESULTS</div>
          <h2>Baseline leaderboard</h2>
          <p>Results are returned by the backend's evaluation run, not hard-coded design numbers.</p>
        </div>
        <span className="tag">{comparisons.length} CANDIDATES</span>
      </div>

      {comparisons.length > 0 ? (
        <div className="model-cards">
          {comparisons.map((item, index) => {
            const note = modelNotes[item.name] ?? {
              tagline: "Candidate classifier",
              best: "Evaluated on the current split.",
              tradeoff: "Needs representative validation.",
            };
            const isWinner = item.name === winner;

            return (
              <motion.article
                key={item.name}
                className={`model-card ${isWinner ? "model-card-winner" : ""}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
              >
                <div className="model-card-top">
                  <span className="model-index">0{index + 1}</span>
                  {isWinner ? <span className="winner-badge"><Sparkles size={12} /> SELECTED</span> : <span className="tag">CANDIDATE</span>}
                </div>
                <h3>{item.name}</h3>
                <p className="model-tagline">{note.tagline}</p>
                <div className="model-card-metrics">
                  <MetricBar label="Macro F1" value={item.macro_f1} index={0} />
                  <MetricBar label="Macro precision" value={item.macro_precision} index={1} />
                  <MetricBar label="Macro recall" value={item.macro_recall} index={2} />
                  <MetricBar label="Accuracy" value={item.accuracy} index={3} />
                </div>
                <div className="model-card-note">
                  <strong>Why consider it</strong><p>{note.best}</p>
                  <strong>Trade-off</strong><p>{note.tradeoff}</p>
                </div>
                <div className="model-card-footer">
                  <span>TF-IDF · uni + bigrams</span>
                  <span>{item.class_order?.length ?? 0} classes</span>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Benchmark data unavailable" detail="Start the API. student-feedback-analyzer will train and compare the baseline classifiers when the backend loads." />
      )}

      {model && (
        <div className="model-footnote">
          <span><Activity size={14} /> Current inference model</span>
          <strong>{model.name ?? winner ?? "Not selected"}</strong>
          <span>Training rows: {model.training_rows ?? "n/a"} · Holdout rows: {model.evaluation?.holdout_rows ?? "n/a"}</span>
        </div>
      )}
    </motion.div>
  );
}
