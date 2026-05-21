from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import SpacyNlpEngine
import re

nlp_engine = SpacyNlpEngine(
    models=[{"lang_code": "en", "model_name": "en_core_web_md"}]
)

analyzer = AnalyzerEngine(nlp_engine=nlp_engine, registry=None)

recognizers = [
    PatternRecognizer(
        supported_entity="SA_ID_NUMBER",
        patterns=[Pattern(name="sa_id", regex=r"\b\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{7}\b", score=0.95)]
    ),
    
    PatternRecognizer(
        supported_entity="PHONE_NUMBER",
        patterns=[
            Pattern(name="phone_intl", regex=r"\+27\s?[6-8]\d{1}\s?\d{3}\s?\d{4}\b", score=0.95),
            Pattern(name="phone_mobile", regex=r"\b0[6-8]\d{8}\b", score=0.95),
        ]
    ),
    
    PatternRecognizer(
        supported_entity="CREDIT_CARD",
        patterns=[
            Pattern(name="card_spaced", regex=r"\b(?:\d{4}[ -]){3}\d{4}\b", score=0.95),
            Pattern(name="card_visa", regex=r"\b4\d{15}\b", score=0.9),
            Pattern(name="card_mc", regex=r"\b5[1-5]\d{14}\b", score=0.9),
            Pattern(name="card_amex", regex=r"\b3[47]\d{13}\b", score=0.9),
        ]
    ),
    
    PatternRecognizer(
        supported_entity="BANK_ACCOUNT",
        patterns=[Pattern(name="bank_labeled", regex=r"(?i)(?:account\s*(?:number|no|#)?[:.]?\s*)(\d{6,16})\b", score=0.95)]
    ),
    
    PatternRecognizer(
        supported_entity="PASSPORT",
        patterns=[Pattern(name="passport", regex=r"\b[A-Z]{1,2}\d{6,9}\b", score=0.85)]
    ),
    
    PatternRecognizer(
        supported_entity="DRIVERS_LICENSE",
        patterns=[Pattern(name="drivers", regex=r"\b\d{2}[A-Z]{3}\d{3}[A-Z]{2}[A-Z0-9]{1,2}\b", score=0.85)]
    ),
    
    # FIX: Added "reference" to alternatives, added explicit patterns
    PatternRecognizer(
        supported_entity="TAX_NUMBER",
        patterns=[
            Pattern(name="tax_labeled", regex=r"(?i)(?:tax\s*(?:number|reference|ref|#)?[:.]?\s*)([01239]\d{9})\b", score=0.9),
            Pattern(name="tax_explicit_ref", regex=r"(?i)Tax\s+reference\s+([01239]\d{9})\b", score=0.95),
            Pattern(name="tax_explicit_num", regex=r"(?i)Tax\s+number\s+([01239]\d{9})\b", score=0.95),
            Pattern(name="tax_standalone", regex=r"\b[1239]\d{9}\b", score=0.85),
            Pattern(name="tax_standalone_0", regex=r"\b0[0-5,9]\d{8}\b", score=0.75),
        ]
    ),
    
    PatternRecognizer(
        supported_entity="COMPANY_REGISTRATION",
        patterns=[
            Pattern(name="cipc", regex=r"\b\d{4}/\d{6,7}/\d{2}\b", score=0.95),
            Pattern(name="cipc_ck", regex=r"\bCK\d{6,7}\b", score=0.9),
        ]
    ),
    
    PatternRecognizer(
        supported_entity="API_KEY",
        patterns=[
            Pattern(name="bearer", regex=r"Bearer\s+[A-Za-z0-9\-._~+/]{20,}", score=0.95),
            Pattern(name="openai_sk", regex=r"\bsk-[A-Za-z0-9]{20,}\b", score=0.95),
            Pattern(name="aws_key", regex=r"\bAKIA[A-Z0-9]{16}\b", score=0.95),
            Pattern(name="jwt", regex=r"\beyJ[A-Za-z0-9\-_]{10,}\.eyJ[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]{10,}\b", score=0.95),
        ]
    ),
    
    PatternRecognizer(
        supported_entity="VEHICLE_REGISTRATION",
        patterns=[Pattern(name="vehicle", regex=r"\b(?:GP|WC|KZN|EC|FS|LP|MP|NC|NW)[\s-]?\d{3}[\s-]?[A-Z]{2,3}\b", score=0.9)]
    ),
    
    PatternRecognizer(
        supported_entity="BRANCH_CODE",
        patterns=[Pattern(name="branch", regex=r"(?i)(?:branch\s*(?:code|no)?[:.]?\s*)(\d{4,6})\b", score=0.9)]
    ),
    
    PatternRecognizer(
        supported_entity="SWIFT_CODE",
        patterns=[
            Pattern(
                name="swift_sa",
                regex=r"\b(?:ABSA|AFRX|BZWM|CITI|FIRN|FNBJ|NEDZ|SBZA|STDB|STDT|ZENG)[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b",
                score=0.95
            ),
        ]
    ),
    
    PatternRecognizer(
        supported_entity="TRUST_REGISTRATION",
        patterns=[Pattern(name="trust", regex=r"\bIT\s?\d{4,6}/\d{2,4}\b", score=0.85)]
    ),
    
    PatternRecognizer(
        supported_entity="FSP_NUMBER",
        patterns=[Pattern(name="fsp", regex=r"(?i)(?:fsp|fais)[\s#:]*(\d{4,6})\b", score=0.85)]
    ),
    
    PatternRecognizer(
        supported_entity="BBBEE_CERTIFICATE",
        patterns=[Pattern(name="bbbee", regex=r"(?i)(?:bbbee|bee)[\s#:]*([A-Z0-9]{6,12})\b", score=0.8)]
    ),
    
    PatternRecognizer(
        supported_entity="POLICY_NUMBER",
        patterns=[Pattern(name="policy", regex=r"(?i)(?:policy|pol)[\s#:]*([A-Z0-9]{6,15})\b", score=0.85)]
    ),
    
    PatternRecognizer(
        supported_entity="MEDICAL_AID",
        patterns=[Pattern(name="medical", regex=r"(?i)(?:member|membership|medical\s*aid)[\s#:]*(\d{6,12})\b", score=0.85)]
    ),
    
    PatternRecognizer(
        supported_entity="CRYPTO_WALLET",
        patterns=[
            Pattern(name="btc", regex=r"\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b", score=0.9),
            Pattern(name="eth", regex=r"\b0x[a-fA-F0-9]{38,42}\b", score=0.95),
        ]
    ),
    
    PatternRecognizer(
        supported_entity="UIF_NUMBER",
        patterns=[
            Pattern(name="uif", regex=r"(?i)(?:uif|ters)[\s#:]*([A-Z0-9]{6,10})\b", score=0.85),
        ]
    ),
    
    PatternRecognizer(
        supported_entity="PRACTICE_NUMBER",
        patterns=[Pattern(name="practice", regex=r"(?i)(?:practice|pr)[\s#:]*(\d{6,8})\b", score=0.8)]
    ),
]

for r in recognizers:
    analyzer.registry.add_recognizer(r)

ENTITIES = [
    "PERSON",
    "EMAIL_ADDRESS",
    "SA_ID_NUMBER",
    "PHONE_NUMBER",
    "CREDIT_CARD",
    "BANK_ACCOUNT",
    "PASSPORT",
    "DRIVERS_LICENSE",
    "TAX_NUMBER",
    "COMPANY_REGISTRATION",
    "API_KEY",
    "VEHICLE_REGISTRATION",
    "BRANCH_CODE",
    "SWIFT_CODE",
    "TRUST_REGISTRATION",
    "FSP_NUMBER",
    "BBBEE_CERTIFICATE",
    "POLICY_NUMBER",
    "MEDICAL_AID",
    "CRYPTO_WALLET",
    "UIF_NUMBER",
    "PRACTICE_NUMBER",
]

CURRENCY_RE = re.compile(r"(?:R|ZAR|USD|EUR|GBP)\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?")
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}:\d{2})?")
SYSTEM_RE = re.compile(r"\b(?:SYSTEM_[A-Z]+|USER_MGR|AUTH_SUCCESS|PENDING_TRF|COMPLETED|FAILED|TRANSFER|DEPOSIT|WITHDRAWAL)\b")

def scrub(text: str) -> str:
    currencies = CURRENCY_RE.findall(text)
    protected = text
    for i, c in enumerate(currencies):
        protected = protected.replace(c, f"__CUR_{i}__", 1)
    
    dates = DATE_RE.findall(protected)
    for i, d in enumerate(dates):
        protected = protected.replace(d, f"__DATE_{i}__", 1)
    
    systems = SYSTEM_RE.findall(protected)
    for i, s in enumerate(systems):
        protected = protected.replace(s, f"__SYS_{i}__", 1)
    
    results = analyzer.analyze(
        text=protected,
        language="en",
        entities=ENTITIES,
        score_threshold=0.3,
    )
    
    results = sorted(results, key=lambda x: x.start)
    filtered = []
    for r in results:
        overlap = False
        for existing in filtered:
            if not (r.end <= existing.start or r.start >= existing.end):
                if r.score > existing.score:
                    filtered.remove(existing)
                else:
                    overlap = True
                    break
        if not overlap:
            filtered.append(r)
    
    result = protected
    offset = 0
    
    for r in filtered:
        adjusted_start = r.start + offset
        adjusted_end = r.end + offset
        original_len = r.end - r.start
        replacement = f"[[{r.entity_type}]]"
        new_len = len(replacement)
        
        result = result[:adjusted_start] + replacement + result[adjusted_end:]
        offset += new_len - original_len
    
    for i, c in enumerate(currencies):
        result = result.replace(f"__CUR_{i}__", c, 1)
    for i, d in enumerate(dates):
        result = result.replace(f"__DATE_{i}__", d, 1)
    for i, s in enumerate(systems):
        result = result.replace(f"__SYS_{i}__", s, 1)
    
    return result