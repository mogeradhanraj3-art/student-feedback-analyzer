from app.services.privacy import redact_personal_data
from app.services.aspects import extract_themes, aspect_sentiments

def test_redacts_email():
    assert "[REDACTED_EMAIL]" in redact_personal_data("Contact me at learner@example.com")

def test_extracts_lab_theme():
    assert "Lab reliability" in extract_themes("The lab computers crash during practicals")

def test_aspect_detection():
    results = aspect_sentiments("The professor explains clearly but the lab equipment is broken")
    assert len(results) >= 1
