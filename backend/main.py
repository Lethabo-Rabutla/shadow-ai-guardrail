from fastapi import FastAPI
from routes.research import router
from fastapi.middleware.cors import CORSMiddleware
from routes.logs import router as logs_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow React app
    allow_credentials=True,
    allow_methods=["*"],  # allow POST, OPTIONS, etc.
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(logs_router)