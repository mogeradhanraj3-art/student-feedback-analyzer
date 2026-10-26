import re

EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
PHONE_RE = re.compile(r"(?<!\w)(?:\+?\d[\d\s().-]{7,}\d)(?!\w)")
ID_RE = re.compile(r"\b(?:student\s*id|roll\s*(?:no|number)?|enrollment\s*(?:no|number)?)\s*[:#-]?\s*[A-Z0-9/-]{4,}\b", re.I)

def redact_personal_data(text: str) -> str:
    text = EMAIL_RE.sub("[REDACTED_EMAIL]", text)
    text = ID_RE.sub("[REDACTED_STUDENT_ID]", text)
    text = PHONE_RE.sub("[REDACTED_PHONE]", text)
    return text
