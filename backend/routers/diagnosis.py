from fastapi import APIRouter
from models.schemas import ManualProfileInput, DiagnosisResponse   
from services.diagnosis_service import compute_diagnosis
import json
from pathlib import Path

router = APIRouter()

DATA_DIR = Path(__file__).parent.parent / "data"


@router.post("/diagnosis", response_model=DiagnosisResponse)       
async def diagnose(payload: ManualProfileInput):
    """Run full market diagnosis for a user profile.
    Returns salary analysis, market score, radar data, opportunities, and heatmap.
    Falls back to pre-cached Carlos data if anything fails."""     
    try:
        return await compute_diagnosis(payload)
    except Exception:
        # Nuclear fallback: return pre-cached Carlos diagnosis     
        fallback_path = DATA_DIR / "fallback_diagnosis.json"       
        with open(fallback_path, "r") as f:
            fallback = json.load(f)
        return DiagnosisResponse(**fallback)
