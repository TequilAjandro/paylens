"""Negotiation service â€” handles chat turns and report generation.

Uses the LLM service for AI hiring manager responses.
Extracts offer amounts from AI text using regex.
Falls back to deterministic responses if LLM is unavailable.       
"""

import re
import json
from pathlib import Path
from models.schemas import (
    NegotiateRequest,
    NegotiateResponse,
    NegotiationReportRequest,
    NegotiationReportResponse,
    ArgumentImpact,
    WorkedArgument,
    FailedArgument,
    SkillGap,
)
from services.llm_service import generate_negotiation_response     
from prompts.negotiation import get_company_prompt

DATA_DIR = Path(__file__).parent.parent / "data"


def _load_company_profiles() -> dict:
    path = DATA_DIR / "company_profiles.json"
    with open(path, "r") as f:
        return json.load(f)


def _extract_offer_from_text(text: str, previous_offer: int) -> int:
    """Extract dollar amount from AI response using regex.
    Returns the last mentioned dollar amount, or previous_offer if none found."""
    # Match patterns like $42,000 or $42000 or $42,000.00
    matches = re.findall(r'\$(\d[\d,]*)', text)
    if matches:
        # Take the last mentioned amount (most likely the current offer)
        last_match = matches[-1].replace(",", "")
        try:
            return int(float(last_match))
        except ValueError:
            pass
    return previous_offer


def _build_profile_summary(profile) -> str:
    """Create a concise profile summary string for the system prompt."""
    return (
        f"{profile.seniority.value}-level {profile.current_role} with "
        f"{profile.years_experience} years of experience in {profile.location}. "
        f"Skills: {', '.join(profile.skills)}"
    )


# Fallback responses per company (used when LLM is unavailable)    
FALLBACK_OPENING = {
    "mercadolibre": (
        "We've reviewed your profile and we're interested in your Python and API "
        "experience. However, we don't see production-scale cloud infrastructure "
        "work in your background. Our initial offer for this role is $48,000. "
        "What makes you think you deserve more?"
    ),
    "globant": (
        "Welcome. We've looked at your background and see solid backend skills. "
        "For this consulting role, we need someone who can adapt to different client "
        "environments quickly. Our starting offer is $43,000. Tell us about your "
        "experience working with diverse tech stacks."
    ),
    "nubank": (
        "We appreciate your interest in Nubank. Your Python background is relevant, "
        "but we're looking for engineers who understand data integrity and security "
        "at a deep level. Our initial offer is $52,000. What experience do you have "
        "with financial systems or compliance-sensitive environments?"
    ),
    "rappi": (
        "Great to meet you. At Rappi, we move fast. We need engineers who can ship "
        "features quickly and handle real-time systems at scale. Your profile looks "
        "promising. We're starting at $40,000. What can you tell me about your "
        "experience shipping under tight deadlines?"
    ),
}

FALLBACK_RESPONSES = [
    "That's an interesting point. However, I'd like to see more concrete evidence. "
    "Can you give me a specific example? Our offer stays at ${offer:,} for now.",

    "I appreciate you sharing that experience. That shows initiative and I'm willing "
    "to adjust. We can move to ${offer:,}. What else can you bring to the table?",

    "You make a good point about {topic}. We value that here. I can revise our offer "
    "to ${offer:,}. This is getting close to our ceiling for this level.",

    "Thank you for a productive conversation. Based on everything discussed, our "
    "final offer is ${offer:,}. This reflects your strengths while accounting for "
    "the areas where you'll need to grow. What do you think?",     
]


async def handle_negotiate_turn(request: NegotiateRequest) -> NegotiateResponse:
    """Process one turn of negotiation and return AI hiring manager's response."""

    company_profiles = _load_company_profiles()
    company_info = company_profiles.get(request.company, company_profiles["mercadolibre"])

    # Build system prompt
    profile_summary = _build_profile_summary(request.user_profile) 
    system_prompt = get_company_prompt(
        company=request.company,
        role=request.role,
        profile_summary=profile_summary,
    )

    # Build conversation messages
    messages = []
    for msg in request.conversation_history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.user_message})

    # Determine turn number
    turn_number = len([m for m in request.conversation_history if m.role == "user"]) + 1

    # Determine previous offer
    previous_offer = company_info["initial_offer"]
    for msg in reversed(request.conversation_history):
        if msg.role == "assistant":
            extracted = _extract_offer_from_text(msg.content, 0)   
            if extracted > 0:
                previous_offer = extracted
                break

    # Try LLM first
    try:
        ai_response = await generate_negotiation_response(
            conversation_history=messages,
            system_prompt=system_prompt,
        )
    except Exception:
        ai_response = None

    # If LLM failed, use fallback
    if not ai_response or len(ai_response) < 20:
        if turn_number == 1 and not request.conversation_history:  
            ai_response = FALLBACK_OPENING.get(request.company, FALLBACK_OPENING["mercadolibre"])
        else:
            # Cycle through fallback responses
            idx = min(turn_number - 1, len(FALLBACK_RESPONSES) - 1)
            # Slight offer increase on turns 2-3
            if turn_number == 2:
                new_offer = previous_offer + 3000
            elif turn_number == 3:
                new_offer = previous_offer + 2000
            else:
                new_offer = previous_offer
            new_offer = min(new_offer, company_info["salary_range_max"])

            topic = request.user_message.split()[:5]
            topic_str = " ".join(topic) if topic else "your experience"

            ai_response = FALLBACK_RESPONSES[idx].format(
                offer=new_offer, topic=topic_str
            )
            previous_offer = new_offer

    # Extract current offer from AI response
    current_offer = _extract_offer_from_text(ai_response, previous_offer)

    # Check if negotiation is complete
    negotiation_complete = (
        turn_number >= 5
        or "final offer" in ai_response.lower()
        or "our final" in ai_response.lower()
    )

    # Determine argument impact (heuristic)
    argument_impact = None
    offer_delta = current_offer - previous_offer
    if offer_delta > 0:
        # Extract what the user said as a brief argument label     
        user_words = request.user_message[:80].strip()
        argument_impact = ArgumentImpact(
            argument=user_words if len(user_words) > 5 else "User's argument",
            impact_usd=offer_delta,
            accepted=True,
        )
    elif turn_number > 1:
        argument_impact = ArgumentImpact(
            argument=request.user_message[:80].strip(),
            impact_usd=0,
            accepted=False,
        )

    return NegotiateResponse(
        ai_response=ai_response,
        current_offer=current_offer,
        turn_number=turn_number,
        negotiation_complete=negotiation_complete,
        argument_impact=argument_impact,
    )


async def generate_report(request: NegotiationReportRequest) -> NegotiationReportResponse:
    """Generate a post-negotiation report analyzing what worked and what didn't.

    Tries LLM for analysis. Falls back to deterministic heuristic analysis.
    """
    negotiated_increase = request.final_offer - request.initial_offer

    # Deterministic report (always works, no LLM needed)
    # Analyze conversation turns to find what moved the needle     
    what_worked = []
    what_didnt = []

    # Walk through user messages and look for offer changes in subsequent AI messages
    user_messages = [m for m in request.full_conversation if m.role == "user"]
    ai_messages = [m for m in request.full_conversation if m.role == "assistant"]

    prev_offer = request.initial_offer
    for i, ai_msg in enumerate(ai_messages):
        offer_in_msg = _extract_offer_from_text(ai_msg.content, prev_offer)
        if i > 0 and i - 1 < len(user_messages):
            user_msg = user_messages[i - 1].content
            short_arg = user_msg[:60].strip()

            delta = offer_in_msg - prev_offer
            if delta > 0:
                what_worked.append(WorkedArgument(
                    argument=short_arg,
                    impact_usd=delta,
                ))
            elif delta == 0 and i > 0:
                # Try to extract a reason from AI response
                reason = "The hiring manager was not convinced by this argument"
                if "don't see" in ai_msg.content.lower():
                    reason = "Lack of concrete evidence"
                elif "need" in ai_msg.content.lower():
                    reason = "Missing key requirement mentioned by hiring manager"
                what_didnt.append(FailedArgument(
                    argument=short_arg,
                    reason=reason,
                ))

        prev_offer = offer_in_msg

    # If we didn't detect specific arguments, add generic ones     
    if not what_worked and negotiated_increase > 0:
        what_worked.append(WorkedArgument(
            argument="Overall negotiation performance",
            impact_usd=negotiated_increase,
        ))

    if not what_didnt:
        what_didnt.append(FailedArgument(
            argument="Cloud/infrastructure experience",
            reason="No evidence of production-scale cloud deployments",
        ))

    # Current ceiling: what they could max out with current skills 
    company_profiles = _load_company_profiles()
    company_info = company_profiles.get(request.company, company_profiles["mercadolibre"])
    current_ceiling = min(
        request.final_offer + 5000,
        int(company_info["salary_range_max"] * 0.7),
    )

    # Potential ceiling: with strategic skills
    potential_ceiling = company_info["salary_range_max"]

    # Skills to close the gap
    skills_gap = [
        SkillGap(skill="Kubernetes (production)", impact_usd=12000),
        SkillGap(skill="Observability/Monitoring", impact_usd=8000),
        SkillGap(skill="Advanced CI/CD pipelines", impact_usd=6000),
    ]

    return NegotiationReportResponse(
        final_offer=request.final_offer,
        initial_offer=request.initial_offer,
        negotiated_increase=negotiated_increase,
        what_worked=what_worked,
        what_didnt_work=what_didnt,
        current_ceiling=current_ceiling,
        potential_ceiling=potential_ceiling,
        skills_to_close_gap=skills_gap,
    )
