from fastapi import APIRouter
from fastapi.responses import JSONResponse
from services.db import supabase

router = APIRouter()

@router.get("/logs")
def get_logs():
    try:
        response = (
            supabase
            .table("logs")
            .select("*")
            .order("timestamp", desc=True)
            .limit(20)
            .execute()
        )

        return response.data  

    except Exception as e:
        print("Logs fetch error:", e)

        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to fetch logs",
                "details": str(e),
            },
        )