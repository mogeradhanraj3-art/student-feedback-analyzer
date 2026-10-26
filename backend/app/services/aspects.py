import re

ASPECTS = {
    "Teaching quality": ["teach", "lecture", "professor", "faculty", "instructor", "explain", "pace", "class"],
    "Course content": ["syllabus", "course", "module", "topic", "curriculum", "material", "notes"],
    "Assignments & exams": ["assignment", "exam", "test", "quiz", "grading", "marks", "deadline", "workload"],
    "Labs & equipment": ["lab", "laboratory", "equipment", "computer", "practical", "projector"],
    "Campus & digital facilities": ["wifi", "wi-fi", "internet", "library", "classroom", "portal", "facility", "facilities", "seat"],
    "Administration": ["timetable", "schedule", "administration", "cancel", "communication", "notice"],
    "Placements & career": ["placement", "internship", "career", "interview", "recruitment"],
    "Student support": ["support", "counsel", "wellbeing", "mental health", "accessibility", "inclusive"],
}
POSITIVE = {"excellent", "clear", "clearly", "helpful", "supportive", "good", "great", "reliable", "useful", "easy", "patient", "approachable", "engaging", "relevant", "organized", "organised", "current", "works", "improve", "love", "enjoy"}
NEGATIVE = {"poor", "bad", "broken", "slow", "crash", "crashes", "outdated", "confusing", "confused", "unclear", "rushed", "difficult", "hard", "stressful", "excessive", "noisy", "missing", "inconsistent", "unprepared", "frequently", "problem", "problems", "not", "never", "too", "fails", "failure", "disconnects", "unreliable"}
NEGATORS = {"not", "never", "no", "isn't", "wasn't", "doesn't", "don't", "cannot", "can't"}

def aspect_sentiments(text: str):
    lower = text.lower()
    tokens = re.findall(r"[a-z']+", lower)
    out = []
    for aspect, keywords in ASPECTS.items():
        hits = [kw for kw in keywords if kw in lower]
        if not hits:
            continue
        window = lower
        pos = sum(1 for word in POSITIVE if re.search(r"\b" + re.escape(word) + r"\b", window))
        neg = sum(1 for word in NEGATIVE if re.search(r"\b" + re.escape(word) + r"\b", window))
        if any(n in tokens for n in NEGATORS):
            neg += 1
        sentiment = "positive" if pos > neg else "negative" if neg > pos else "mixed/unclear"
        evidence = next((sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", text) if any(h in sentence.lower() for h in hits)), text[:180])
        out.append({"aspect": aspect, "sentiment": sentiment, "evidence": evidence[:220]})
    return out

def extract_themes(text: str):
    lower = text.lower()
    mapping = {
        "Lecture pace": ["too fast", "pace", "rushed", "too quickly"],
        "Assessment workload": ["assignment", "deadline", "workload", "exam", "grading", "marks"],
        "Infrastructure": ["wifi", "wi-fi", "projector", "classroom", "library", "facility", "facilities"],
        "Lab reliability": ["lab", "laboratory", "equipment", "computer", "practical"],
        "Course clarity": ["confusing", "unclear", "explain", "syllabus", "material", "notes"],
        "Career readiness": ["placement", "internship", "interview", "career"],
        "Faculty support": ["professor", "faculty", "instructor", "support", "helpful"],
    }
    return [theme for theme, words in mapping.items() if any(w in lower for w in words)]
