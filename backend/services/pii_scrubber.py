from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import SpacyNlpEngine
from presidio_anonymizer import AnonymizerEngine

nlp_engine = SpacyNlpEngine(
    models=[{"lang_code": "en", "model_name": "en_core_web_sm"}]
)

analyzer = AnalyzerEngine(nlp_engine=nlp_engine)
anonymizer = AnonymizerEngine()

# ── 1. SA ID Number (13 digits) ──────────────────────────────────────────────
sa_id_recognizer = PatternRecognizer(
    supported_entity="SA_ID_NUMBER",
    patterns=[Pattern(name="sa_id", regex=r"\b\d{13}\b", score=0.9)]
)

# ── 2. Phone numbers (SA formats: 07xxxxxxxx, +27xxxxxxxxx, 0xx xxx xxxx) ────
phone_recognizer = PatternRecognizer(
    supported_entity="PHONE_NUMBER",
    patterns=[
        Pattern(name="sa_phone_local",    regex=r"\b0[6-8]\d{7,8}\b",         score=0.85),
        Pattern(name="sa_phone_intl",     regex=r"\+27\s?\d{2}\s?\d{3}\s?\d{4}\b", score=0.9),
        Pattern(name="sa_phone_spaced",   regex=r"\b0\d{2}\s\d{3}\s\d{4}\b",  score=0.85),
    ]
)

# ── 3. Credit / Debit card numbers ───────────────────────────────────────────
card_recognizer = PatternRecognizer(
    supported_entity="CREDIT_CARD",
    patterns=[
        Pattern(name="card_spaced", regex=r"\b(?:\d{4}[ -]){3}\d{4}\b", score=0.9),  # 4111 1111 1111 1111
        Pattern(name="card_solid",  regex=r"\b(?:4\d{15}|5[1-5]\d{14}|3[47]\d{13})\b", score=0.85),  # Visa/MC/Amex prefixes
    ]
)

# ── 4. API keys / tokens (generic long alphanumeric secrets) ─────────────────
api_key_recognizer = PatternRecognizer(
    supported_entity="API_KEY",
    patterns=[
        Pattern(name="bearer_token",  regex=r"Bearer\s+[A-Za-z0-9\-._~+/]+=*",     score=0.95),
        Pattern(name="sk_key",        regex=r"\bsk-[A-Za-z0-9]{20,}\b",             score=0.95),  # 👈 add this
        Pattern(name="generic_secret",regex=r"\b[A-Za-z0-9]{32,}\b",               score=0.6),
    ]
)

# ── 5. Bank account numbers (SA: 6–11 digits) ────────────────────────────────
bank_account_recognizer = PatternRecognizer(
    supported_entity="BANK_ACCOUNT",
    patterns=[Pattern(name="sa_bank_account", regex=r"\b\d{6,11}\b", score=0.6)]
)

# ── 6. Passport numbers ───────────────────────────────────────────────────────
passport_recognizer = PatternRecognizer(
    supported_entity="PASSPORT",
    patterns=[Pattern(name="passport", regex=r"\b[A-Z]{1,2}\d{6,9}\b", score=0.75)]
)

# ── Register all custom recognizers ──────────────────────────────────────────
for recognizer in [
    sa_id_recognizer,
    phone_recognizer,
    card_recognizer,
    api_key_recognizer,
    bank_account_recognizer,
    passport_recognizer,
]:
    analyzer.registry.add_recognizer(recognizer)

# ── Entities to detect (built-in + custom) ────────────────────────────────────
ENTITIES = [
    "PERSON", "EMAIL_ADDRESS", "LOCATION", "ORG",   # Built-in Presidio
    "PHONE_NUMBER", "CREDIT_CARD",                   # Override built-in with better patterns
    "SA_ID_NUMBER", "API_KEY", "BANK_ACCOUNT", "PASSPORT",  # Custom
]

def scrub(text: str) -> str:
    results = analyzer.analyze(
        text=text,
        language="en",
        entities=ENTITIES,          # 👈 explicit list prevents DATE_TIME misclassification
    )
    anonymized = anonymizer.anonymize(text=text, analyzer_results=results)
    return anonymized.text