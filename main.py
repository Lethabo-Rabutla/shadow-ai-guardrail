from fastapi import FastAPI
from routes.research import router

app = FastAPI()

app.include_router(router)