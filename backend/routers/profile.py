from fastapi import APIRouter

router = APIRouter()


@router.post("/github")
async def analyze_github():
    return {"message": "TODO — see BE-02"}


@router.post("/manual")
async def manual_profile():
    return {"message": "TODO — see BE-02"}
