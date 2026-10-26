# 5-minute demo script

1. **Open Overview (30 sec):** Explain that Student Feedback Analyzer turns free-text feedback into aggregate signals, not verdicts.
2. **Analyze a response (60 sec):** Paste a mixed response, add a subject, run analysis. Show sentiment, confidence, aspect signals, themes, and redaction preview.
3. **Bulk import (60 sec):** Upload a CSV using the provided schema. Show imported/skipped row counts.
4. **Feedback explorer (45 sec):** Search, filter by sentiment/priority, and delete a record.
5. **Insight engine (60 sec):** Explain recurring themes and heuristic review recommendations. Emphasize that a human validates them.
6. **Reports (45 sec):** Download CSV and JSON. Open the model card and point out the synthetic-data warning.
7. **Close (20 sec):** Describe the next research step: train and evaluate on real, consented, de-identified educational feedback.

## Demo input
"The professor explains concepts clearly, but the lab computers crash during practicals."

Expected behavior: a sentiment prediction, teaching/lab aspect hints, lab-related theme, and a privacy-safe preview. Exact predictions depend on the trained model and should not be promised.
