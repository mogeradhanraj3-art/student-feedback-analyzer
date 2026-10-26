from pathlib import Path
import joblib
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB, ComplementNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, classification_report, confusion_matrix
from ..config import SEED_DATA_PATH, MODEL_PATH


class SentimentEngine:
    """Train and compare classical NLP baselines, then select by validation macro-F1.

    The bundled seed dataset is synthetic. Its holdout metrics are useful only for
    checking the pipeline, not for claiming real-world model quality.
    """
    def __init__(self):
        self.pipeline = None
        self.metadata = {"name": "TF-IDF + Logistic Regression", "trained": False, "training_rows": 0, "evaluation": {}, "comparison": []}
        self.load_or_train()

    @staticmethod
    def _make_pipeline(classifier_name: str):
        if classifier_name == "Multinomial Naive Bayes":
            classifier = MultinomialNB(alpha=0.5)
        elif classifier_name == "Complement Naive Bayes":
            classifier = ComplementNB(alpha=0.5)
        else:
            classifier = LogisticRegression(max_iter=1500, class_weight="balanced", random_state=42)
        return Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True, strip_accents="unicode")),
            ("classifier", classifier),
        ])

    def load_or_train(self):
        if MODEL_PATH.exists():
            try:
                payload = joblib.load(MODEL_PATH)
                self.pipeline = payload["pipeline"]
                self.metadata = payload.get("metadata", self.metadata)
                # Retrain old model artifacts that predate the model comparison lab.
                if not self.metadata.get("comparison"):
                    self.train()
                return
            except Exception:
                pass
        self.train()

    def train(self):
        path = SEED_DATA_PATH
        if not path.exists():
            path = Path(__file__).resolve().parents[2] / "data" / "seed_feedback.csv"
        df = pd.read_csv(path).dropna(subset=["feedback", "sentiment"])
        df["feedback"] = df["feedback"].astype(str).str.strip()
        df["sentiment"] = df["sentiment"].astype(str).str.lower().str.strip()
        df = df[df["feedback"].str.len() >= 3]
        X, y = df["feedback"], df["sentiment"]
        comparison = []
        eval_pipeline = None
        y_test = None
        X_train = X
        y_train = y
        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.25, random_state=42, stratify=y
            )
            candidates = ["Multinomial Naive Bayes", "Complement Naive Bayes", "Logistic Regression"]
            for name in candidates:
                candidate = self._make_pipeline(name)
                candidate.fit(X_train, y_train)
                preds = candidate.predict(X_test)
                report = classification_report(y_test, preds, output_dict=True, zero_division=0)
                comparison.append({
                    "name": name,
                    "vectorizer": "TF-IDF (unigrams + bigrams)",
                    "accuracy": round(float(accuracy_score(y_test, preds)), 4),
                    "macro_f1": round(float(f1_score(y_test, preds, average="macro", zero_division=0)), 4),
                    "macro_precision": round(float(precision_score(y_test, preds, average="macro", zero_division=0)), 4),
                    "macro_recall": round(float(recall_score(y_test, preds, average="macro", zero_division=0)), 4),
                    "per_class": {k: {m: round(float(v.get(m, 0)), 4) for m in ("precision", "recall", "f1-score", "support")} for k, v in report.items() if k in set(y.unique())},
                    "confusion_matrix": confusion_matrix(y_test, preds, labels=sorted(y.unique())).tolist(),
                    "class_order": sorted(y.unique()),
                })
            # Macro-F1 treats each sentiment class equally, important if labels are imbalanced.
            champion = max(comparison, key=lambda row: (row["macro_f1"], row["macro_recall"], row["accuracy"]))
            selected_name = champion["name"]
            self.pipeline = self._make_pipeline(selected_name)
            self.pipeline.fit(X, y)
            evaluation = {
                "holdout_accuracy": champion["accuracy"],
                "holdout_macro_f1": champion["macro_f1"],
                "holdout_rows": int(len(y_test)),
                "selection_metric": "macro-F1",
                "warning": "Metrics are from a small synthetic seed dataset and are not representative of real-world performance. Do not use them as a performance claim.",
            }
        except Exception as exc:
            # Keep the application usable if the dataset is too small for stratification.
            selected_name = "Logistic Regression"
            self.pipeline = self._make_pipeline(selected_name)
            self.pipeline.fit(X, y)
            evaluation = {"warning": f"Holdout comparison unavailable: {exc}"}

        self.metadata = {
            "name": f"TF-IDF + {selected_name}",
            "selected_classifier": selected_name,
            "selection_metric": "macro-F1",
            "trained": True,
            "training_rows": int(len(df)),
            "classes": sorted(df["sentiment"].unique().tolist()),
            "evaluation": evaluation,
            "comparison": sorted(comparison, key=lambda row: row.get("macro_f1", 0), reverse=True),
            "methodology": {
                "text_features": "TF-IDF with unigrams and bigrams",
                "candidates": ["Multinomial Naive Bayes", "Complement Naive Bayes", "Logistic Regression"],
                "split": "Stratified 75/25 holdout, random_state=42",
                "selection": "Highest holdout macro-F1; tie-break on macro recall then accuracy",
                "limitations": ["Synthetic seed data", "Small holdout set", "No external validation", "Probability calibration not assessed"],
            },
            "data_note": "Bundled seed examples are synthetic. Replace them with consented, representative feedback and run a robust validation study before drawing conclusions.",
        }
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        try:
            joblib.dump({"pipeline": self.pipeline, "metadata": self.metadata}, MODEL_PATH)
        except Exception:
            pass

    def predict(self, text: str):
        probs = self.pipeline.predict_proba([text])[0]
        classes = self.pipeline.classes_
        pairs = {str(k): round(float(v), 4) for k, v in zip(classes, probs)}
        label = str(classes[int(probs.argmax())])
        return label, float(probs.max()), pairs
