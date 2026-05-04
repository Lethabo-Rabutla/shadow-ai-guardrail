from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from services.db import supabase

router = APIRouter()

@router.get("/logs")
def get_logs(organization_id: str = Query(..., description="Organization ID to filter logs")):
    try:
        response = (
            supabase
            .table("logs")
            .select("*")
            .eq("organization_id", organization_id)
            .order("timestamp", desc=True)
            .limit(50)
            .execute()
        )
        return response.data
    except Exception as e:
        print("Logs fetch error:", e)
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to fetch logs", "details": str(e)},
        )