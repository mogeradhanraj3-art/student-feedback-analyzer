# Student Feedback Analyzer

## Problem statement
Educational institutions collect open-ended feedback, but manually reviewing large volumes is slow and inconsistent. Student Feedback Analyzer assists reviewers by grouping sentiment signals, detecting commonly mentioned aspects, and surfacing themes for human follow-up.

## Objectives
1. Classify student feedback as positive, neutral, or negative.
2. Extract broad aspects such as teaching, course content, assessments, labs, facilities, administration, placements, and student support.
3. Surface recurring keyword themes and urgency cues.
4. Offer searchable records, aggregate charts, and exportable summaries.
5. make privacy, uncertainty, fairness, and human accountability visible in the interface.

## AI/ML methods
- TF-IDF with unigram/bigram features.
- Logistic Regression baseline classifier.
- Explainable lexicons for aspect sentiment, emotion hints, urgency cues, and themes.
- Evaluation with accuracy and macro-F1 on a holdout set.
- Future research extension: compare Linear SVM and a fine-tuned transformer on a labeled, consented education-domain dataset.

## Limitations
The bundled data is synthetic. Lexicon-based aspect/emotion/urgency analysis is approximate. Sentiment may be wrong for sarcasm, mixed opinions, multilingual text, and unfamiliar vocabulary. Probabilities are not necessarily calibrated. Aggregate patterns can reflect sampling bias.

## Ethical, legal, and social design
- Data minimization and redaction preview.
- No individual student scoring or automated disciplinary action.
- Transparent model card and limitations.
- Human review of recommendations.
- Fairness evaluation across relevant language and student groups where lawful and appropriate.
- Institution-approved consent, retention, access, and deletion policies.
- Avoid collecting sensitive personal information; use secure hosting and access control before deployment.

## Evaluation plan
1. Establish annotator guidelines and label a representative dataset.
2. Use a source/time-aware train/validation/test split.
3. Compare TF-IDF + Logistic Regression against TF-IDF + Linear SVM.
4. Report macro-F1, class-wise precision/recall, confusion matrix, and error analysis.
5. Test robustness to typos, negation, mixed sentiment, short comments, and class imbalance.
6. Audit privacy redaction and subgroup performance.

## Suggested research workflow
Select two recent 2025–2026 papers through the university library or Google Scholar. Verify bibliographic details and read the actual papers before citing them. Compare their datasets, models, evaluation protocols, and limitations with Student Feedback Analyzer. Do not cite generated or unverified references.
