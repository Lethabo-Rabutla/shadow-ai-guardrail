
from fastapi import APIRouter
from services.db import supabase

router = APIRouter()

@router.get("/logs")
def get_logs():
    response = supabase.table("logs").select("*").order("timestamp", desc=True).limit(20).execute()
    return response.data