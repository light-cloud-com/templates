from fastapi import FastAPI

from app.routers import root

app = FastAPI(title="FastAPI on Light Cloud")
app.include_router(root.router)
