from fastapi import APIRouter
from fastapi.responses import JSONResponse
from models.schemas import ResearchRequest
from services.pipeline import process_research

router = APIRouter()

@router.post("/research")
def research(request: ResearchRequest):
    try:
        return process_research(request.query)

    except Exception as e:
        print("❌ Research route error:", e)

        return JSONResponse(
            status_code=500,
            content={
                "answer": "❌ Something went wrong. Please try again.",
                "sources": []
            },
        )