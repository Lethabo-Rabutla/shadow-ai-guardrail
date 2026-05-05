from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routes.research import router
from routes.logs import router as logs_router
from routes.admin import router as admin_router
from dotenv import load_dotenv
import os

load_dotenv() 

app = FastAPI()

origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3001"),
]

print("✅ Allowed origins:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(logs_router)
app.include_router(admin_router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"🔥 ERROR: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc)
        },
    )