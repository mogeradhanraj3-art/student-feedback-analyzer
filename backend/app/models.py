from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from .database import Base

class FeedbackRecord(Base):
    __tablename__ = "feedback_records"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    sentiment = Column(String(20), nullable=False, index=True)
    confidence = Column(Float, nullable=False, default=0.0)
    subject = Column(String(160), nullable=True, index=True)
    aspect_results = Column(Text, nullable=False, default="[]")
    emotion = Column(String(40), nullable=False, default="unclear")
    urgency = Column(String(20), nullable=False, default="low")
    source = Column(String(30), nullable=False, default="manual")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
