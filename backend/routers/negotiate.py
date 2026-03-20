from fastapi import APIRouter

router = APIRouter()


@router.post("/negotiate")
async def negotiate():
    return {"message": "TODO — see BE-06"}


@router.post("/negotiate/report")
async def negotiate_report():
    return {"message": "TODO — see BE-06"}
