from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def index():
    return {"message": "Hello from FastAPI on Light Cloud"}
