from services.pii_scrubber import scrub
from services.llm_service import run_research
from services.logger import log_event

def process_research(query: str):

    # --- SCRUB ---
    try:
        cleaned = scrub(query)
    except Exception as e:
        print(" Scrubber failed:", e)
        cleaned = query  # fallback to original (don’t break flow)

    # --- LLM ---
    try:
        result = run_research(cleaned)
    except Exception as e:
        print("LLM failed:", e)

        # 🔥 RETURN SAME STRUCTURE (IMPORTANT)
        return {
            "answer": "AI service is temporarily unavailable. Please try again.",
            "sources": []
        }

    # --- LOGGING ---
    try:
        log_event(
            original=query,
            cleaned=cleaned,
            response=result
        )
    except Exception as e:
        print("Logging failed:", e)

    # --- FINAL RESPONSE (UNCHANGED) ---
    return {
    "answer": getattr(result, "summary", "No response available"),
    "sources": getattr(result, "sources", [])
}