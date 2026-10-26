import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BASE_DIR.parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'student_feedback_analyzer.db'}")
SEED_DATA_PATH = Path(os.getenv("SEED_DATA_PATH", str(PROJECT_ROOT / "data" / "seed_feedback.csv")))
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(BASE_DIR / "artifacts" / "sentiment_model.joblib")))
CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]
