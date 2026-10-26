import csv, io, json
from datetime import datetime
from typing import Optional
import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from .config import CORS_ORIGINS
from .database import Base, engine, get_db
from .models import FeedbackRecord
from .schemas import AnalyzeRequest, FeedbackCreate
from .services.ml import SentimentEngine
from .services.analysis import analyze_text
from .services.insights import build_insights

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Student Feedback Analyzer API", version="1.0.0", description="Sentiment and aspect insight API for student feedback.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
sentiment_engine = SentimentEngine()

def _aspects(record):
    try:
        return json.loads(record.aspect_results or "[]")
    except Exception:
        return []

def _serialize(record):
    return {
        "id": record.id,
        "text": record.text,
        "sentiment": record.sentiment,
        "confidence": record.confidence,
        "subject": record.subject,
        "emotion": record.emotion,
        "urgency": record.urgency,
        "aspects": _aspects(record),
        "source": record.source,
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }

def _record(db, text, result, subject=None, source="manual"):
    item = FeedbackRecord(
        text=text,
        sentiment=result["sentiment"],
        confidence=result["confidence"],
        subject=subject,
        aspect_results=json.dumps(result["aspects"]),
        emotion=result["emotion"],
        urgency=result["urgency"],
        source=source,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@app.get("/")
def root():
    return {"name": "Student Feedback Analyzer API", "docs": "/docs", "status": "online"}

@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": sentiment_engine.pipeline is not None, "model": sentiment_engine.metadata.get("name")}

@app.get("/api/model")
def model_info():
    return sentiment_engine.metadata

@app.post("/api/analyze")
def analyze(payload: AnalyzeRequest, db: Session = Depends(get_db)):
    result = analyze_text(payload.text, sentiment_engine)
    if payload.save:
        _record(db, result["redacted_preview"], result, payload.subject, "manual")
    return result

@app.post("/api/feedback")
def create_feedback(payload: FeedbackCreate, db: Session = Depends(get_db)):
    result = analyze_text(payload.text, sentiment_engine)
    item = _record(db, result["redacted_preview"], result, payload.subject, "manual")
    return {"item": _serialize(item), "analysis": result}

@app.post("/api/feedback/bulk")
async def bulk_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")
    raw = await file.read()
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="CSV exceeds the 10 MB upload limit.")
    try:
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read CSV: {exc}")
    col_map = {str(c).strip().lower(): c for c in df.columns}
    text_col = next((col_map[k] for k in ["feedback", "text", "comment", "review", "response"] if k in col_map), None)
    if text_col is None:
        raise HTTPException(status_code=400, detail="CSV needs a text column named feedback, text, comment, review, or response.")
    subject_col = next((col_map[k] for k in ["subject", "course", "department"] if k in col_map), None)
    imported, skipped = 0, 0
    for _, row in df.iterrows():
        value = row.get(text_col)
        if pd.isna(value) or len(str(value).strip()) < 3:
            skipped += 1
            continue
        text = str(value).strip()[:5000]
        result = analyze_text(text, sentiment_engine)
        subject = str(row.get(subject_col)).strip()[:160] if subject_col and pd.notna(row.get(subject_col)) else None
        _record(db, result["redacted_preview"], result, subject, "csv")
        imported += 1
    return {"imported": imported, "skipped": skipped, "filename": file.filename, "message": f"Imported {imported} feedback rows."}

@app.get("/api/feedback")
def list_feedback(
    q: Optional[str] = None,
    sentiment: Optional[str] = None,
    subject: Optional[str] = None,
    urgency: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(FeedbackRecord)
    if q:
        query = query.filter(FeedbackRecord.text.ilike(f"%{q[:100]}%"))
    if sentiment and sentiment in {"positive", "negative", "neutral"}:
        query = query.filter(FeedbackRecord.sentiment == sentiment)
    if subject:
        query = query.filter(FeedbackRecord.subject == subject)
    if urgency and urgency in {"low", "medium", "high"}:
        query = query.filter(FeedbackRecord.urgency == urgency)
    total = query.count()
    records = query.order_by(desc(FeedbackRecord.id)).offset(offset).limit(limit).all()
    return {"items": [_serialize(r) for r in records], "total": total, "limit": limit, "offset": offset}

@app.delete("/api/feedback/{feedback_id}")
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    item = db.query(FeedbackRecord).filter(FeedbackRecord.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback record not found.")
    db.delete(item)
    db.commit()
    return {"deleted": True, "id": feedback_id}

@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    records = db.query(FeedbackRecord).order_by(desc(FeedbackRecord.id)).limit(5000).all()
    total = len(records)
    counts = {"positive": 0, "neutral": 0, "negative": 0}
    aspect_counts = {}
    theme_counts = {}
    trend = {}
    subjects = {}
    for r in records:
        counts[r.sentiment] = counts.get(r.sentiment, 0) + 1
        day = r.created_at.date().isoformat() if r.created_at else "unknown"
        trend.setdefault(day, {"date": day, "positive": 0, "neutral": 0, "negative": 0})
        trend[day][r.sentiment] = trend[day].get(r.sentiment, 0) + 1
        subject = r.subject or "Unspecified"
        subjects.setdefault(subject, {"subject": subject, "total": 0, "positive": 0, "neutral": 0, "negative": 0})
        subjects[subject]["total"] += 1
        subjects[subject][r.sentiment] = subjects[subject].get(r.sentiment, 0) + 1
        for a in _aspects(r):
            key = a.get("aspect", "Other")
            aspect_counts.setdefault(key, {"aspect": key, "positive": 0, "negative": 0, "mixed/unclear": 0, "total": 0})
            aspect_counts[key][a.get("sentiment", "mixed/unclear")] = aspect_counts[key].get(a.get("sentiment", "mixed/unclear"), 0) + 1
            aspect_counts[key]["total"] += 1
    trend_rows = sorted(trend.values(), key=lambda x: x["date"])[-14:]
    negative_pct = round(counts["negative"] / total * 100, 1) if total else 0
    return {
        "total": total,
        "sentiment_counts": counts,
        "sentiment_percentages": {k: round(v / total * 100, 1) if total else 0 for k, v in counts.items()},
        "negative_pct": negative_pct,
        "high_urgency": sum(1 for r in records if r.urgency == "high"),
        "avg_confidence": round(sum(r.confidence for r in records) / total, 3) if total else 0,
        "trend": trend_rows,
        "aspects": sorted(aspect_counts.values(), key=lambda x: x["total"], reverse=True),
        "subjects": sorted(subjects.values(), key=lambda x: x["total"], reverse=True)[:10],
        "recent": [_serialize(r) for r in records[:8]],
        "model": sentiment_engine.metadata.get("name", "Unknown"),
    }

@app.get("/api/insights")
def insights(db: Session = Depends(get_db)):
    records = db.query(FeedbackRecord).order_by(desc(FeedbackRecord.id)).limit(5000).all()
    wrapped = []
    for r in records:
        class Proxy: pass
        p = Proxy()
        p.sentiment = r.sentiment
        p.aspect_results = _aspects(r)
        p.themes = []
        wrapped.append(p)
    result = build_insights(wrapped)
    # Derive themes from stored text so theme analytics stays consistent.
    from .services.aspects import extract_themes
    theme_counts = {}
    for r in records:
        for theme in extract_themes(r.text):
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
    result["top_issues"] = [{"theme": k, "mentions": v} for k, v in sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:8]]
    return result

@app.get("/api/reports/summary")
def report_summary(db: Session = Depends(get_db)):
    data = dashboard(db)
    insights_data = insights(db)
    return {"generated_at": datetime.utcnow().isoformat() + "Z", "dashboard": data, "insights": insights_data}

@app.get("/api/reports/export.csv")
def export_csv(db: Session = Depends(get_db)):
    records = db.query(FeedbackRecord).order_by(desc(FeedbackRecord.id)).all()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["id", "created_at", "subject", "feedback", "sentiment", "confidence", "emotion", "urgency", "source", "aspects"])
    for r in records:
        writer.writerow([r.id, r.created_at.isoformat() if r.created_at else "", r.subject or "", r.text, r.sentiment, r.confidence, r.emotion, r.urgency, r.source, json.dumps(_aspects(r), ensure_ascii=False)])
    buffer.seek(0)
    return StreamingResponse(iter([buffer.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=student-feedback-report.csv"})
