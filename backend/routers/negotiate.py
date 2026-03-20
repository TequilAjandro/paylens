from fastapi import APIRouter
from models.schemas import (
    NegotiateRequest,
    NegotiateResponse,
    NegotiationReportRequest,
    NegotiationReportResponse,
)
from services.negotiation_service import handle_negotiate_turn, generate_report

router = APIRouter()


@router.post("/negotiate", response_model=NegotiateResponse)       
async def negotiate(payload: NegotiateRequest):
    """One turn of salary negotiation with an AI hiring manager.   

    The AI plays the role of a hiring manager from the selected company
    (MercadoLibre, Globant, Nubank, or Rappi). Each company has a unique
    personality and negotiation style.

    Conversation history must be passed with each call (stateless).
    After 5 turns, the negotiation auto-completes.
    """
    return await handle_negotiate_turn(payload)


@router.post("/negotiate/report", response_model=NegotiationReportResponse)
async def negotiate_report(payload: NegotiationReportRequest):     
    """Generate a post-negotiation report.

    Analyzes the full conversation to determine:
    - What arguments worked and their dollar impact
    - What arguments failed and why
    - Current salary ceiling with existing skills
    - Potential ceiling if strategic skills are added
    - Specific skills to close the gap
    """
    return await generate_report(payload)
