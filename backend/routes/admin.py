from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.db import supabase

router = APIRouter()

class RegisterUserRequest(BaseModel):
    email: str
    password: str
    organization_id: str  # admin's org, passed from frontend

@router.post("/admin/register-user")
def register_user(payload: RegisterUserRequest):
    try:
        # Create user in Supabase Auth using service role
        auth_response = supabase.auth.admin.create_user({
            "email": payload.email,
            "password": payload.password,
            "email_confirm": True,  # skip email verification
        })

        new_user = auth_response.user
        if not new_user:
            raise HTTPException(status_code=400, detail="Failed to create user")

        # Insert into profiles table with same org as admin
        supabase.table("profiles").insert({
            "id": new_user.id,
            "email": payload.email,
            "role": "user",
            "organization_id": payload.organization_id,
        }).execute()

        return {"message": f"User {payload.email} created successfully"}

    except Exception as e:
        print("Register user error:", e)
        raise HTTPException(status_code=500, detail=str(e))