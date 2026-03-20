"""
LLM Service — Gemini 2.5 Flash only, with hardcoded fallback.

If Gemini fails (no API key, rate limit, error), returns hardcoded text.
Never raises — always returns a string.
"""

import os
import logging
from google import genai

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-2.5-flash"

# Lazy client
_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set — using hardcoded fallback")
            return None
        _client = genai.Client(api_key=api_key)
    return _client


# --- Hardcoded Fallback Responses ---

FALLBACK_DIAGNOSIS_NARRATIVE = (
    "Your Python expertise places you in the top 28% of backend developers in Mexico, "
    "but your lack of cloud infrastructure skills (Kubernetes, AWS) is costing you "
    "approximately $24,000 per year. The LATAM market is shifting rapidly toward "
    "cloud-native roles. Adding just one strategic skill like Kubernetes would unlock "
    "47 new high-value roles and increase your earning potential by 30%."
)

FALLBACK_OPPORTUNITIES_TEXT = (
    "Your biggest opportunity is Kubernetes — it has 140% growth in demand and commands "
    "a 30% salary premium. Combined with CI/CD skills, you could unlock over 79 new "
    "positions and increase your ceiling by $20,000/year within 3-6 months of focused learning."
)

FALLBACK_NEGOTIATION_RESPONSE = (
    "Thank you for sharing that. Your experience is noted, but I need to see more "
    "concrete evidence of production-scale infrastructure work. Our current offer "
    "stands at $45,000. Could you tell me about a specific project where you handled "
    "high-traffic systems?"
)


# --- Public API ---

async def generate_text(prompt: str, system_prompt: str = "", timeout: int = 10) -> str:
    """Generic LLM call via Gemini 2.5 Flash.

    Args:
        prompt: The user prompt / content
        system_prompt: System instruction for the model
        timeout: Kept for signature compatibility

    Returns:
        Generated text string. Returns fallback on all failures.
    """
    client = _get_client()
    if client is None:
        return FALLBACK_DIAGNOSIS_NARRATIVE

    contents = []
    if system_prompt:
        contents.append({"role": "user", "parts": [system_prompt]})
        contents.append({"role": "model", "parts": ["Understood. I will follow those instructions."]})
    contents.append({"role": "user", "parts": [prompt]})

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
        )
        text = response.text
        if text and len(text) > 20:
            return text
    except Exception as e:
        logger.warning(f"Gemini API failed: {e}")

    return FALLBACK_DIAGNOSIS_NARRATIVE


async def generate_diagnosis_narrative(
    profile_skills: list[str],
    seniority: str,
    location: str,
    years_experience: int,
    role: str,
    market_score: int,
    gap_annual: int,
    key_missing_skill: str,
) -> str:
    """Generate a personalized market diagnosis narrative.

    Falls back to hardcoded text if LLM fails.
    """
    from prompts.diagnosis import DIAGNOSIS_NARRATIVE_PROMPT

    user_context = (
        f"Profile: {role}, {seniority} level, {years_experience} years experience, "
        f"located in {location}.\n"
        f"Skills: {', '.join(profile_skills)}\n"
        f"Market score: {market_score}/100\n"
        f"Annual salary gap: ${gap_annual:,}\n"
        f"Key missing skill: {key_missing_skill}\n\n"
        f"Write a 2-3 sentence market summary for this engineer. Be honest and specific."
    )

    try:
        result = await generate_text(user_context, DIAGNOSIS_NARRATIVE_PROMPT, timeout=10)
        if result and len(result) > 20:
            return result
    except Exception:
        pass

    return FALLBACK_DIAGNOSIS_NARRATIVE


async def generate_opportunities_text(
    current_skills: list[str],
    missing_skills: list[dict],
) -> str:
    """Generate text about skill opportunities.

    Falls back to hardcoded text if LLM fails.
    """
    from prompts.diagnosis import OPPORTUNITIES_PROMPT

    context = (
        f"Current skills: {', '.join(current_skills)}\n"
        f"Top missing skills with highest impact:\n"
    )
    for skill in missing_skills[:3]:
        context += f"- {skill['skill']}: +{skill['salary_increase_pct']}% salary, {skill['time_to_learn']}\n"

    context += "\nWrite 2-3 sentences about the biggest opportunity."

    try:
        result = await generate_text(context, OPPORTUNITIES_PROMPT, timeout=10)
        if result and len(result) > 20:
            return result
    except Exception:
        pass

    return FALLBACK_OPPORTUNITIES_TEXT


async def generate_negotiation_response(
    conversation_history: list[dict],
    system_prompt: str,
) -> str:
    """Generate one turn of negotiation chat.

    Args:
        conversation_history: List of {"role": "user"|"assistant", "content": "..."}
        system_prompt: Company-specific negotiation system prompt

    Returns:
        AI hiring manager's response text.
    """
    client = _get_client()
    if client is None:
        return FALLBACK_NEGOTIATION_RESPONSE

    # Build contents: system prompt as first exchange, then conversation history
    contents = [
        {"role": "user", "parts": [system_prompt]},
        {"role": "model", "parts": ["Understood. I will act as the hiring manager."]},
    ]
    for msg in conversation_history:
        role = "model" if msg["role"] == "assistant" else "user"
        contents.append({"role": role, "parts": [msg["content"]]})

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
        )
        text = response.text
        if text and len(text) > 5:
            return text
    except Exception as e:
        logger.warning(f"Gemini negotiation failed: {e}")

    return FALLBACK_NEGOTIATION_RESPONSE
