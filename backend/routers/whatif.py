from fastapi import APIRouter

router = APIRouter()


@router.post("/what-if")
async def what_if():
    return {"message": "TODO — see BE-05"}
