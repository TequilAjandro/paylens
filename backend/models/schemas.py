from pydantic import BaseModel, Field
from typing import Literal, Optional
from enum import Enum


# --- Enums ---
class Seniority(str, Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"
    staff = "staff"


class TrendDirection(str, Enum):
    rising = "rising"
    stable = "stable"
    declining = "declining"


class HeatmapColor(str, Enum):
    green = "green"
    yellow = "yellow"
    red = "red"


# --- Profile ---
class ManualProfileInput(BaseModel):
    skills: list[str] = Field(..., min_length=1, max_length=20)       
    seniority: Seniority
    location: str = Field(..., min_length=2, max_length=50)
    years_experience: int = Field(..., ge=0, le=50)
    current_role: str = Field(..., min_length=2, max_length=100)      


class GitHubProfileInput(BaseModel):
    github_url: str = Field(..., pattern=r'^https://github\.com/[a-zA-Z0-9_-]+$')


class LanguageBreakdown(BaseModel):
    language: str
    percentage: float
    repos_count: int


class GitHubProfileOutput(BaseModel):
    username: str
    detected_skills: list[str]
    primary_languages: list[LanguageBreakdown]
    estimated_seniority: Seniority
    years_active: int
    total_repos: int
    total_commits_last_year: int
    notable_patterns: list[str]
    profile_summary: str


# --- Diagnosis ---
class SalaryRange(BaseModel):
    min: int
    max: int
    currency: str = "USD"


class SalaryDiagnosis(BaseModel):
    current_range: SalaryRange
    potential_range: SalaryRange
    gap_annual: int
    gap_3year: int
    current_job_count: int
    potential_job_count: int
    job_count_increase_pct: int
    key_missing_skill: str
    secondary_missing_skills: list[str]


class MarketScore(BaseModel):
    overall: int = Field(..., ge=0, le=100)
    breakdown: dict[str, int]  # e.g. {"skill_demand": 78, "skill_breadth": 65, ...}


class SkillAnalysis(BaseModel):
    skill_name: str
    current_level: str
    market_demand: TrendDirection
    percentile_rank: int = Field(..., ge=0, le=100)
    salary_impact_usd: int
    trend_direction: TrendDirection
    trend_growth_pct: float


class PeerComparison(BaseModel):
    axes: list[str]
    user_values: list[int]
    peer_avg_values: list[int]
    seniority_group: str
    region: str
    overall_percentile: int
    percentile_label: str


class Opportunity(BaseModel):
    skill: str
    unlock_count: int
    salary_increase_pct: int
    salary_increase_usd: int
    demand_trend: TrendDirection
    trend_growth_pct: float
    difficulty: Literal["low", "medium", "high"]
    time_to_learn: str


class HeatmapEntry(BaseModel):
    skill: str
    trend: TrendDirection
    growth_pct: float
    color: HeatmapColor


class DiagnosisResponse(BaseModel):
    salary_diagnosis: SalaryDiagnosis
    market_score: MarketScore
    skills_analysis: list[SkillAnalysis]
    peer_comparison: PeerComparison
    opportunities: list[Opportunity]
    demand_heatmap: list[HeatmapEntry]
    market_summary: str
    value_narrative: str


# --- What-If ---
class WhatIfRequest(BaseModel):
    current_skills: list[str]
    hypothetical_add: list[str] = []
    hypothetical_remove: list[str] = []
    seniority: Seniority
    location: str


class WhatIfResponse(BaseModel):
    new_score: int
    score_change: str
    new_salary_range: SalaryRange
    salary_change_usd: int
    new_job_count: int
    job_count_change: str
    new_percentile: int
    percentile_change: str
    insight: str


# --- Negotiation ---
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class NegotiateRequest(BaseModel):
    company: Literal["mercadolibre", "globant", "nubank", "rappi"]    
    role: str
    user_profile: ManualProfileInput
    conversation_history: list[ChatMessage] = []
    user_message: str


class ArgumentImpact(BaseModel):
    argument: str
    impact_usd: int
    accepted: bool


class NegotiateResponse(BaseModel):
    ai_response: str
    current_offer: int
    turn_number: int
    negotiation_complete: bool
    argument_impact: Optional[ArgumentImpact] = None


# --- Negotiation Report ---
class WorkedArgument(BaseModel):
    argument: str
    impact_usd: int


class FailedArgument(BaseModel):
    argument: str
    reason: str


class SkillGap(BaseModel):
    skill: str
    impact_usd: int


class NegotiationReportRequest(BaseModel):
    company: Literal["mercadolibre", "globant", "nubank", "rappi"]    
    role: str
    user_profile: ManualProfileInput
    full_conversation: list[ChatMessage]
    final_offer: int
    initial_offer: int


class NegotiationReportResponse(BaseModel):
    final_offer: int
    initial_offer: int
    negotiated_increase: int
    what_worked: list[WorkedArgument]
    what_didnt_work: list[FailedArgument]
    current_ceiling: int
    potential_ceiling: int
    skills_to_close_gap: list[SkillGap]


# --- Roadmap ---
class RoadmapPhase(BaseModel):
    phase: str
    actions: list[str]


class RoadmapResponse(BaseModel):
    target_skill: str
    impact_usd: int
    total_duration: str
    phases: list[RoadmapPhase]
