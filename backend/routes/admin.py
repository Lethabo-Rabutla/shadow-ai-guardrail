from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.db import supabase

router = APIRouter()

DEMO_ORG_ID = "3eea1500-016c-4a1f-909d-67f48ff8129b"

class RegisterUserRequest(BaseModel):
    email: str
    password: str
    organization_id: str

@router.post("/admin/register-user")
def register_user(payload: RegisterUserRequest):
    # Block registration for demo organization
    if payload.organization_id == DEMO_ORG_ID:
        raise HTTPException(
            status_code=403,
            detail="User registration is disabled in demo mode."
        )

    try:
        auth_response = supabase.auth.admin.create_user({
            "email": payload.email,
            "password": payload.password,
            "email_confirm": True,
        })

        new_user = auth_response.user
        if not new_user:
            raise HTTPException(status_code=400, detail="Failed to create user")

        supabase.table("profiles").insert({
            "id": new_user.id,
            "email": payload.email,
            "role": "user",
            "organization_id": payload.organization_id,
        }).execute()

        return {"message": f"User {payload.email} created successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print("Register user error:", e)
        raise HTTPException(status_code=500, detail=str(e))