import json
from datetime import datetime
from pathlib import Path

LOG_FILE = Path("logs.jsonl")

def get_readable_time():
    return datetime.now().strftime("%d %B %Y, %H:%M:%S")

def clean_response(response):
    """
    Ensures we NEVER nest response inside response
    """
    if isinstance(response, dict):
        return response
    if hasattr(response, "dict"):
        return response.dict()
    return str(response)

def log_event(original: str, cleaned: str, response):
    entry = {
        "timestamp": get_readable_time(),
        "original_prompt": original,
        "cleaned_prompt": cleaned,
        "response": clean_response(response)
    }
    
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")
        