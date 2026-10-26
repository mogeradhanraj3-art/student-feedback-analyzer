from .aspects import aspect_sentiments, extract_themes
from .privacy import redact_personal_data

NEGATIVE_CUES = ["broken", "unsafe", "harassment", "threat", "urgent", "crash", "crashes", "unacceptable", "cannot access", "not working", "failed", "failure", "bullying", "discrimination"]
EMOTION_CUES = {
    "frustration": ["frustrating", "annoying", "fed up", "angry", "stressful", "unacceptable"],
    "appreciation": ["thank", "appreciate", "excellent", "helpful", "supportive", "love"],
    "confusion": ["confusing", "unclear", "don't understand", "do not understand", "confused"],
    "concern": ["worried", "concerned", "unsafe", "anxious", "problem", "issue"],
}

def emotion_hint(text: str):
    lower = text.lower()
    scores = {name: sum(1 for cue in cues if cue in lower) for name, cues in EMOTION_CUES.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] else "unclear"

def urgency_hint(text: str):
    lower = text.lower()
    if any(cue in lower for cue in ["unsafe", "harassment", "threat", "discrimination", "bullying", "urgent", "emergency"]):
        return "high"
    if any(cue in lower for cue in NEGATIVE_CUES) or any(cue in lower for cue in ["very poor", "constantly", "frequently", "broken"]):
        return "medium"
    return "low"

def analyze_text(text: str, engine):
    cleaned = " ".join(text.strip().split())
    sentiment, confidence, probabilities = engine.predict(cleaned)
    return {
        "sentiment": sentiment,
        "confidence": round(confidence, 4),
        "probabilities": probabilities,
        "emotion": emotion_hint(cleaned),
        "urgency": urgency_hint(cleaned),
        "aspects": aspect_sentiments(cleaned),
        "themes": extract_themes(cleaned),
        "redacted_preview": redact_personal_data(cleaned),
        "caveats": [
            "Sentiment is a model estimate, not a fact about the author.",
            "Aspect, emotion, and urgency labels use explainable keyword rules and may miss context or sarcasm.",
            "Do not use this output alone for high-impact decisions."
        ]
    }
