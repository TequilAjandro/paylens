from fastapi import APIRouter

router = APIRouter()


@router.post("/diagnosis")
async def diagnose():
    return {"message": "TODO — see BE-03"}
