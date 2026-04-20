import json
from datetime import datetime
from services.db import save_log

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
    
    save_log(entry)
        