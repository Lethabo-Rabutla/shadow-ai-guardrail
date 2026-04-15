from services.pii_scrubber import scrub
from services.llm_service import run_research
from services.logger import log_event

def process_research(query: str):

    cleaned = scrub(query)

    result = run_research(cleaned)
    
    log_event(
        original=query,
        cleaned=cleaned,
        response=result
    )
    print("Processed research query and logged the event.")

    return result