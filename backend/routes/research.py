from fastapi import APIRouter
from models.schemas import ResearchRequest
from services.llm_service import run_research
from services.pipeline import process_research

router = APIRouter()

@router.post("/research")
def research(request: ResearchRequest):
    return process_research(request.query)