from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import SpacyNlpEngine
from presidio_anonymizer import AnonymizerEngine

# FORCE SMALL MODEL (IMPORTANT FIX)
nlp_engine = SpacyNlpEngine(
    models=[{"lang_code": "en", "model_name": "en_core_web_sm"}]
)

analyzer = AnalyzerEngine(nlp_engine=nlp_engine)
anonymizer = AnonymizerEngine()

def scrub(text: str) -> str:
    results = analyzer.analyze(
        text=text,
        language="en"
    )

    anonymized_text = anonymizer.anonymize(
        text=text,
        analyzer_results=results
    )

    return anonymized_text.text