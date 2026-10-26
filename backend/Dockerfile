FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY tests ./tests
COPY data ./data
RUN mkdir -p /app/artifacts /app/db
ENV SEED_DATA_PATH=/app/data/seed_feedback.csv
ENV MODEL_PATH=/app/artifacts/sentiment_model.joblib
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
