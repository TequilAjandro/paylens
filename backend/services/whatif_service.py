"""What-If simulation service.

Reuses scoring logic from diagnosis_service to compute before/after
comparisons when hypothetical skills are added or removed.
"""

import json
from pathlib import Path
from models.schemas import (
    WhatIfRequest,
    WhatIfResponse,
    SalaryRange,
    Seniority,
)
from services.diagnosis_service import (
    _load_json,
    _compute_market_score,
    _compute_radar,
    _find_salary_band,
    _find_opportunities,
)

DATA_DIR = Path(__file__).parent.parent / "data"


def _estimate_job_count(skills: list[str], skill_data: list[dict]) -> int:
    """Estimate job count based on user skills matching market data."""
    skill_data_map = {s["skill_name"]: s for s in skill_data}      
    total = 0
    for skill in skills:
        if skill in skill_data_map:
            total += int(skill_data_map[skill]["job_count_estimate"] * 0.015)
    return max(50, total)


def compute_whatif(request: WhatIfRequest) -> WhatIfResponse:      
    """Compute before/after comparison for hypothetical skill changes."""

    skill_data = _load_json("skill_demand.json")
    salary_bands = _load_json("salary_bands.json")
    peer_data = _load_json("peer_benchmarks.json")

    # --- Baseline (current skills) ---
    baseline_score = _compute_market_score(
        request.current_skills, skill_data, 3, request.seniority.value
    )

    # Find a salary band for baseline (use Backend Developer as default role)
    baseline_band = _find_salary_band(
        salary_bands, "Backend Developer", request.seniority.value, request.location
    )
    if baseline_band:
        baseline_salary_min = baseline_band["salary_min_usd"]      
        baseline_salary_max = baseline_band["salary_max_usd"]      
    else:
        baseline_salary_min, baseline_salary_max = 28000, 38000    

    baseline_radar = _compute_radar(
        request.current_skills, request.seniority.value, request.location, peer_data
    )
    baseline_job_count = _estimate_job_count(request.current_skills, skill_data)

    # --- Projected (modified skills) ---
    new_skills = list(request.current_skills)

    # Remove skills
    for skill in request.hypothetical_remove:
        if skill in new_skills:
            new_skills.remove(skill)

    # Add skills
    for skill in request.hypothetical_add:
        if skill not in new_skills:
            new_skills.append(skill)

    projected_score = _compute_market_score(
        new_skills, skill_data, 3, request.seniority.value
    )

    projected_radar = _compute_radar(
        new_skills, request.seniority.value, request.location, peer_data
    )
    projected_job_count = _estimate_job_count(new_skills, skill_data)

    # Calculate salary projection based on added skills' premiums  
    skill_data_map = {s["skill_name"]: s for s in skill_data}      
    total_premium = 0
    for skill in request.hypothetical_add:
        if skill in skill_data_map:
            total_premium += skill_data_map[skill]["salary_premium_pct"]

    for skill in request.hypothetical_remove:
        if skill in skill_data_map:
            total_premium -= skill_data_map[skill]["salary_premium_pct"]

    projected_salary_min = int(baseline_salary_min * (1 + total_premium / 100))
    projected_salary_max = int(baseline_salary_max * (1 + total_premium / 100))

    # --- Compute deltas ---
    score_delta = projected_score.overall - baseline_score.overall 
    salary_delta = projected_salary_min - baseline_salary_min      
    job_delta = projected_job_count - baseline_job_count
    percentile_delta = baseline_radar.overall_percentile - projected_radar.overall_percentile

    # Format delta strings
    score_change = f"+{score_delta}" if score_delta >= 0 else str(score_delta)
    job_change = f"+{job_delta}" if job_delta >= 0 else str(job_delta)
    pct_change = f"+{percentile_delta}" if percentile_delta >= 0 else str(percentile_delta)

    # Generate insight
    if request.hypothetical_add and score_delta > 0:
        added = ", ".join(request.hypothetical_add)
        insight = (
            f"Adding {added} moves you from top {baseline_radar.overall_percentile}% "
            f"to top {projected_radar.overall_percentile}% of {request.seniority.value}-level "
            f"LATAM developers and unlocks {max(0, job_delta)} new roles."
        )
    elif request.hypothetical_remove and score_delta < 0:
        removed = ", ".join(request.hypothetical_remove)
        insight = (
            f"Removing {removed} would decrease your market score by {abs(score_delta)} points "
            f"and reduce your job matches by {abs(job_delta)}."    
        )
    elif score_delta == 0:
        insight = "This change would have minimal impact on your market position."
    else:
        changes = []
        if request.hypothetical_add:
            changes.append(f"adding {', '.join(request.hypothetical_add)}")
        if request.hypothetical_remove:
            changes.append(f"removing {', '.join(request.hypothetical_remove)}")
        change_desc = " and ".join(changes)
        insight = (
            f"By {change_desc}, your market score changes by {score_change} points "
            f"with a salary impact of ${abs(salary_delta):,}/year."
        )

    return WhatIfResponse(
        new_score=projected_score.overall,
        score_change=score_change,
        new_salary_range=SalaryRange(
            min=projected_salary_min,
            max=projected_salary_max,
        ),
        salary_change_usd=abs(salary_delta),
        new_job_count=projected_job_count,
        job_count_change=job_change,
        new_percentile=projected_radar.overall_percentile,
        percentile_change=pct_change,
        insight=insight,
    )
