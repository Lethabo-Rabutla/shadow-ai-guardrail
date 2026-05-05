from fastapi import APIRouter
from fastapi.responses import JSONResponse
from models.schemas import ResearchRequest
from services.pipeline import process_research
from services.rate_limiter import check_rate_limit

router = APIRouter()

@router.post("/research")
def research(request: ResearchRequest):
    try:
        # Check rate limit before doing anything
        if not check_rate_limit(request.user_id):
            return JSONResponse(
                status_code=429,
                content={
                    "answer": "⚠️ Daily limit reached. You've used all 10 requests for today. Come back tomorrow!",
                    "sources": []
                }
            )

        return process_research(request.query, request.user_id, request.organization_id)

    except Exception as e:
        print("❌ Research route error:", e)
        return JSONResponse(
            status_code=500,
            content={
                "answer": "❌ Something went wrong. Please try again.",
                "sources": []
            },
        )