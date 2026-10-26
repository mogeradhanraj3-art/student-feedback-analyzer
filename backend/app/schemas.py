from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=3, max_length=5000)
    subject: Optional[str] = Field(default=None, max_length=160)
    save: bool = True

class FeedbackCreate(BaseModel):
    text: str = Field(min_length=3, max_length=5000)
    subject: Optional[str] = Field(default=None, max_length=160)

class AspectResult(BaseModel):
    aspect: str
    sentiment: str
    evidence: str

class AnalysisResult(BaseModel):
    sentiment: str
    confidence: float
    probabilities: Dict[str, float]
    emotion: str
    urgency: str
    aspects: List[AspectResult]
    themes: List[str]
    redacted_preview: str
    caveats: List[str]

class FeedbackItem(BaseModel):
    id: int
    text: str
    sentiment: str
    confidence: float
    subject: Optional[str] = None
    emotion: str
    urgency: str
    aspects: List[Dict[str, Any]]
    source: str
    created_at: Optional[str] = None
