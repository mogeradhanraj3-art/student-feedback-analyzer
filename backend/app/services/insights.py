from collections import Counter, defaultdict
from datetime import datetime

def build_insights(records):
    if not records:
        return {
            "headline": "Your feedback signal is ready for its first wave.",
            "recommendations": [{"title": "Import feedback", "detail": "Upload a CSV or analyze a response to populate the insight engine.", "priority": "low", "evidence": "No records yet."}],
            "top_issues": [], "aspect_summary": []
        }
    neg = [r for r in records if r.sentiment == "negative"]
    aspect_counts = defaultdict(Counter)
    issue_counts = Counter()
    for r in records:
        for item in (r.aspect_results or []):
            aspect_counts[item.get("aspect", "Other")][item.get("sentiment", "mixed/unclear")] += 1
        for theme in getattr(r, "themes", []) or []:
            issue_counts[theme] += 1
    recommendations = []
    for aspect, counts in sorted(aspect_counts.items(), key=lambda x: x[1].get("negative", 0), reverse=True):
        total = sum(counts.values())
        negative = counts.get("negative", 0)
        if total and negative / total >= 0.35:
            recommendations.append({
                "title": f"Review {aspect.lower()}",
                "detail": f"{negative} negative aspect signals out of {total} detected mentions. Validate examples with the relevant team before acting.",
                "priority": "high" if negative / total >= 0.6 else "medium",
                "evidence": f"{round(negative / total * 100)}% negative among detected mentions"
            })
    if not recommendations:
        recommendations.append({
            "title": "Keep monitoring the signal",
            "detail": "No aspect has crossed the heuristic review threshold. This is not proof that no issues exist.",
            "priority": "low",
            "evidence": "Rule-based threshold check"
        })
    return {
        "headline": f"{len(records)} responses analyzed. {len(neg)} are classified as negative and may deserve a closer look.",
        "recommendations": recommendations[:6],
        "top_issues": [{"theme": k, "mentions": v} for k, v in issue_counts.most_common(8)],
        "aspect_summary": [{"aspect": k, **dict(v)} for k, v in aspect_counts.items()]
    }
