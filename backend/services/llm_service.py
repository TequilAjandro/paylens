"""
LLM Service â€” Multi-provider with LiteLLM Router + hardcoded fallback.

Fallback chain:
1. Groq (llama-3.1-70b-versatile) â€” fast, 30 RPM free tier       
2. Gemini (gemini-2.0-flash) â€” quality, 15 RPM free tier
3. Ollama local (qwen3.5:9b-q4_K_M) â€” zero network dependency    
4. Hardcoded response â€” nuclear fallback, never fails

Timeout: 10s per call. If all providers fail, return hardcoded text.
"""

import os
import logging
from litellm import Router

logger = logging.getLogger(__name__)

# --- LiteLLM Router Configuration (VERBATIM from DEFINITIVE_ROADMAP) ---

def _build_model_list() -> list[dict]:
    """Build the model list dynamically based on available API keys."""
    models = []

    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        models.append({
            "model_name": "analysis",
            "litellm_params": {
                "model": "groq/llama-3.1-70b-versatile",
                "api_key": groq_key,
            },
        })

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        models.append({
            "model_name": "analysis",
            "litellm_params": {
                "model": "gemini/gemini-2.0-flash",
                "api_key": gemini_key,
            },
        })

    ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    models.append({
        "model_name": "analysis",
        "litellm_params": {
            "model": "ollama/qwen3.5:9b",
            "api_base": ollama_host,
        },
    })

    return models


def _get_router() -> Router | None:
    """Create and return a LiteLLM Router instance."""
    model_list = _build_model_list()
    if not model_list:
        return None

    try:
        return Router(
            model_list=model_list,
            fallbacks=[{"analysis": ["analysis"]}],
            num_retries=2,
            allowed_fails=1,
            cooldown_time=30,
            timeout=10,
        )
    except Exception as e:
        logger.warning(f"Failed to create LiteLLM Router: {e}")    
        return None


# Lazy initialization
_router: Router | None = None


def _ensure_router() -> Router | None:
    global _router
    if _router is None:
        _router = _get_router()
    return _router


# --- Hardcoded Fallback Responses ---

FALLBACK_DIAGNOSIS_NARRATIVE = (
    "Your Python expertise places you in the top 28% of backend developers in Mexico, "
    "but your lack of cloud infrastructure skills (Kubernetes, AWS) is costing you "
    "approximately $24,000 per year. The LATAM market is shifting rapidly toward "
    "cloud-native roles. Adding just one strategic skill like Kubernetes would unlock "
    "47 new high-value roles and increase your earning potential by 30%."
)

FALLBACK_OPPORTUNITIES_TEXT = (
    "Your biggest opportunity is Kubernetes â€” it has 140% growth in demand and commands "
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
    """Generic LLM call with full fallback chain.

    Args:
        prompt: The user prompt / content
        system_prompt: System instruction for the model
        timeout: Max seconds to wait

    Returns:
        Generated text string. Never raises â€” returns fallback on all failures.
    """
    router = _ensure_router()

    if router is None:
        logger.warning("No LLM router available, returning fallback")
        return FALLBACK_DIAGNOSIS_NARRATIVE

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    try:
        response = await router.acompletion(
            model="analysis",
            messages=messages,
            timeout=timeout,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.warning(f"All LLM providers failed: {e}")
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

    Uses the diagnosis system prompt from MASTER_PLAN section 13.  
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
    router = _ensure_router()

    if router is None:
        return FALLBACK_NEGOTIATION_RESPONSE

    messages = [{"role": "system", "content": system_prompt}]      
    messages.extend(conversation_history)

    try:
        response = await router.acompletion(
            model="analysis",
            messages=messages,
            timeout=15,  # Negotiation gets a bit more time        
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.warning(f"Negotiation LLM failed: {e}")
        return FALLBACK_NEGOTIATION_RESPONSE
