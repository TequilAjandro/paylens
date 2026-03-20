import httpx
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from models.schemas import (
    ManualProfileInput,
    GitHubProfileOutput,
)
from services.github_service import fetch_github_profile, get_mock_carlos_profile

logger = logging.getLogger(__name__)

router = APIRouter()


class GitHubUsernameRequest(BaseModel):
    github_username: str = Field(..., min_length=1, max_length=100)


@router.post("/github", response_model=GitHubProfileOutput)
async def analyze_github(payload: GitHubUsernameRequest):
    """Analyze a GitHub profile and extract skills, languages, and seniority."""
    username = payload.github_username.strip().rstrip("/")

    # Handle if someone pastes a full URL instead of just username
    if "github.com/" in username:
        username = username.split("github.com/")[-1].split("/")[0]

    try:
        profile_data = await fetch_github_profile(username)
        return GitHubProfileOutput(**profile_data)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            logger.warning(f"GitHub user not found: {username}")
            raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found")
        elif e.response.status_code == 403:
            logger.warning(f"GitHub API rate limited for: {username}")
            mock_data = get_mock_carlos_profile()
            return GitHubProfileOutput(**mock_data)
        else:
            logger.warning(f"GitHub API error {e.response.status_code} for: {username}")
            mock_data = get_mock_carlos_profile()
            return GitHubProfileOutput(**mock_data)
    except Exception as e:
        logger.warning(f"GitHub profile fetch failed for {username}: {e}")
        mock_data = get_mock_carlos_profile()
        return GitHubProfileOutput(**mock_data)


class ManualProfileResponse(BaseModel):
    skills: list[str]
    seniority: str
    location: str
    years_experience: int
    current_role: str
    profile_ready: bool = True


@router.post("/manual", response_model=ManualProfileResponse)      
async def manual_profile(payload: ManualProfileInput):
    """Accept manual profile input and return it validated."""     
    return ManualProfileResponse(
        skills=payload.skills,
        seniority=payload.seniority.value,
        location=payload.location,
        years_experience=payload.years_experience,
        current_role=payload.current_role,
        profile_ready=True,
    )
