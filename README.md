# student-feedback-analyzer

A full-stack student-feedback-analyzer that turns unstructured feedback into sentiment classifications, aspect-level insights, recurring issue signals, and actionable reports.

> **Important data note:** The included seed dataset is synthetic and is only for local setup/testing. It is not evidence about real students, a real institution, or model performance. Before using the platform for institutional decisions, train/evaluate on consented, representative, de-identified feedback and review predictions with humans.

## Product capabilities

- Single-text analysis with sentiment, confidence, emotion cues, urgency, aspect opinions, and privacy redaction preview.
- CSV upload for batch analysis; supports common `feedback`, `text`, `comment`, `review`, or `response` columns and optional subject/course/date fields.
- Persistent SQLite feedback ledger with search, filters, pagination, and deletion.
- Dashboard KPIs, sentiment distribution, aspect heatmap, trend chart, top themes, and priority queue.
- Insights page with transparent rule-based recommendations and recurring-issue detection.
- Reports page with downloadable CSV and JSON summaries, explicit API error/retry states, loading feedback, and a responsive model card.
- Smooth route transitions with reduced-motion support; animated report sections and status indicators.
- Model diagnostics endpoint: class distribution, model metadata, and evaluation on a held-out split of the bundled synthetic training examples.
- API documentation from FastAPI at `/docs`.
- Premium dark interface with electric-lime accents, responsive layout, motion, keyboard-friendly controls, and charting.
- Docker Compose for a one-command local environment.

## Architecture

- `frontend/`: Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide.
- `backend/`: FastAPI, scikit-learn TF-IDF + Logistic Regression, SQLite, Pandas.
- `data/seed_feedback.csv`: small synthetic examples for local smoke testing.
- `backend/app/services/`: ML, aspect extraction, privacy redaction, insights.

## Run locally

Requirements: Python 3.11+ and Node.js 20+.

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\\Scripts\\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

The backend initializes its SQLite database and trains a baseline classifier from `data/seed_feedback.csv` on first start if no saved model exists.

### 2. Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

The frontend expects the API at `http://localhost:8000` by default. Set `NEXT_PUBLIC_API_URL` if needed.

### 3. Docker Compose

From the project root:

```bash
docker compose up --build
```

Frontend: `http://localhost:3000`  
Backend docs: `http://localhost:8000/docs`

## Input format

CSV headers can include:
- Required: one of `feedback`, `text`, `comment`, `review`, `response`
- Optional: `subject`, `course`, `department`, `date`, `semester`

Example:

```csv
feedback,subject,date
"The instructor explains difficult ideas clearly",Machine Learning,2026-09-12
"The lab computers crash during practicals",Computer Networks,2026-09-13
```

## API overview

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/feedback`
- `POST /api/analyze`
- `POST /api/feedback`
- `POST /api/feedback/bulk`
- `DELETE /api/feedback/{feedback_id}`
- `GET /api/insights`
- `GET /api/reports/summary`
- `GET /api/reports/export.csv`
- `GET /api/model`

## Model design and limitations

The baseline is TF-IDF n-grams + Logistic Regression. This is a transparent, lightweight baseline, not a claim of state-of-the-art performance. Aspect and urgency extraction currently use explainable lexicons/rules; the generated recommendations are heuristics, not causal findings. Confidence is a model probability and should not be treated as calibrated certainty unless calibration is evaluated.

Before any real deployment:
1. Replace synthetic examples with a properly licensed, de-identified dataset.
2. Use annotator guidelines and measure inter-annotator agreement.
3. Split by source/time/student where appropriate to avoid leakage.
4. Evaluate macro-F1, per-class precision/recall, confusion matrix, and subgroup performance.
5. Add authentication, role-based access, audit logs, rate limits, backups, secret management, and institution-approved retention policies.
6. Conduct privacy/security review. Do not use the tool to punish students or automatically rank individual faculty.
7. Treat results as decision support. A human must review high-impact conclusions.

## Development commands

Backend tests:

```bash
cd backend
pytest
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

## License

Add the license required by your institution/team before publishing.

## Model Lab: baseline comparison

The backend trains and compares three classical text-classification candidates using a shared TF-IDF feature pipeline:

- **Multinomial Naive Bayes**: fast probabilistic text-classification baseline.
- **Complement Naive Bayes**: a Naive Bayes variant worth testing when classes are uneven.
- **Logistic Regression**: a strong linear text-classification benchmark.

The experiment uses a stratified 75/25 holdout split (`random_state=42`) and reports accuracy, macro precision, macro recall, macro-F1, per-class scores, and a confusion matrix. The candidate with the highest macro-F1 is selected for inference; ties are broken by macro recall and then accuracy. The frontend's **Model Lab** page displays the returned evaluation results and animates the metric bars using Framer Motion. The model selection is calculated by the backend, not hard-coded in the UI.

**Scientific limitation:** the bundled seed dataset is synthetic and small. The displayed holdout metrics are a software/ML pipeline smoke test only. Do not claim real-world accuracy from them. For a defensible evaluation, replace the seed data with consented and human-labeled student feedback, deduplicate before splitting, use a separate untouched test set (and consider cross-validation on the training portion), inspect class-level errors, and assess probability calibration and subgroup performance where appropriate.

### Run locally

Start the FastAPI backend and Next.js frontend using the instructions above. Open **Model Lab** from the left navigation to inspect the candidate comparison. The first backend start trains the candidates and saves the selected pipeline and metadata in the backend artifacts directory.
