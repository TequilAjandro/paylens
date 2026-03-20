import json
from pathlib import Path
from models.schemas import (
    ManualProfileInput,
    DiagnosisResponse,
    SalaryRange,
    SalaryDiagnosis,
    MarketScore,
    SkillAnalysis,
    PeerComparison,
    Opportunity,
    HeatmapEntry,
)
from services.llm_service import generate_diagnosis_narrative, generate_value_narrative

DATA_DIR = Path(__file__).parent.parent / "data"

# Skill -> category mapping for radar chart
SKILL_CATEGORY_MAP = {
    "JavaScript": "Frontend", "TypeScript": "Frontend", "React": "Frontend",
    "Angular": "Frontend", "Vue": "Frontend", "Next.js": "Frontend",
    "HTML": "Frontend", "CSS": "Frontend", "Tailwind": "Frontend", 
    "Python": "Backend", "Java": "Backend", "Go": "Backend",       
    "Rust": "Backend", "C#": "Backend", "Node.js": "Backend",      
    "FastAPI": "Backend", "Django": "Backend", "Spring": "Backend",
    "Express": "Backend", "Ruby": "Backend", "PHP": "Backend",     
    "Docker": "DevOps", "Kubernetes": "DevOps", "AWS": "DevOps",   
    "GCP": "DevOps", "Azure": "DevOps", "Terraform": "DevOps",     
    "CI/CD": "DevOps", "Jenkins": "DevOps", "GitHub Actions": "DevOps",
    "Linux": "DevOps",
    "SQL": "Data", "PostgreSQL": "Data", "MongoDB": "Data",        
    "Redis": "Data", "Kafka": "Data", "Elasticsearch": "Data",     
    "GraphQL": "Data", "MySQL": "Data",
    "TensorFlow": "AI/ML", "PyTorch": "AI/ML", "Scikit-learn": "AI/ML",
    "Machine Learning": "AI/ML", "Generative AI": "AI/ML", "NLP": "AI/ML",
    "Pandas": "AI/ML",
    "Leadership": "Soft Skills", "Communication": "Soft Skills",   
    "Mentoring": "Soft Skills", "Architecture": "Soft Skills",     
    "System Design": "Soft Skills", "Agile": "Soft Skills",        
}

RADAR_AXES = ["Frontend", "Backend", "DevOps", "Data", "AI/ML", "Soft Skills"]


def _load_json(filename: str) -> dict | list:
    filepath = DATA_DIR / filename
    with open(filepath, "r") as f:
        return json.load(f)


def _find_salary_band(salary_bands: list, role: str, seniority: str, country: str) -> dict | None:
    """Find the best matching salary band for a role/seniority/country."""
    # Exact match
    for band in salary_bands:
        if (band["role"].lower() == role.lower()
                and band["seniority"] == seniority
                and band["country"].lower() == country.lower()):   
            return band

    # Fuzzy match on role (contains keyword)
    role_lower = role.lower()
    for band in salary_bands:
        if (any(word in band["role"].lower() for word in role_lower.split())
                and band["seniority"] == seniority
                and band["country"].lower() == country.lower()):   
            return band

    # Fallback: same seniority + country, any role
    for band in salary_bands:
        if band["seniority"] == seniority and band["country"].lower() == country.lower():
            return band

    # Last resort: same seniority, Mexico
    for band in salary_bands:
        if band["seniority"] == seniority and band["country"] == "Mexico":
            return band

    return None


def _compute_market_score(user_skills: list[str], skill_data: list[dict],
                          years_exp: int, seniority: str) -> MarketScore:
    """Compute the 0-100 market score with 4-dimension breakdown."""
    skill_data_map = {s["skill_name"]: s for s in skill_data}      

    # Skill demand: average demand_score of user's skills
    user_demand_scores = []
    for skill in user_skills:
        if skill in skill_data_map:
            user_demand_scores.append(skill_data_map[skill]["demand_score"])
    skill_demand = int(sum(user_demand_scores) / max(len(user_demand_scores), 1))

    # Skill breadth: how many categories the user covers (out of 6)
    user_categories = set()
    for skill in user_skills:
        if skill in SKILL_CATEGORY_MAP:
            user_categories.add(SKILL_CATEGORY_MAP[skill])
    skill_breadth = min(100, int(len(user_categories) / 6 * 100))  

    # Market fit: weighted by salary premium
    premiums = []
    for skill in user_skills:
        if skill in skill_data_map:
            premiums.append(max(0, skill_data_map[skill]["salary_premium_pct"]))
    market_fit = min(100, int(sum(premiums) / max(len(premiums), 1) * 3.5))

    # Growth potential: based on growth trends of user skills      
    growth_scores = []
    for skill in user_skills:
        if skill in skill_data_map:
            growth = skill_data_map[skill]["growth_pct"]
            growth_scores.append(min(100, max(0, 50 + growth)))    
    growth_potential = int(sum(growth_scores) / max(len(growth_scores), 1))

    # Adjust for experience
    exp_bonus = min(10, years_exp)
    overall = int(
        skill_demand * 0.30
        + skill_breadth * 0.20
        + market_fit * 0.25
        + growth_potential * 0.15
        + exp_bonus * 0.10 * 10
    )
    overall = max(0, min(100, overall))

    return MarketScore(
        overall=overall,
        breakdown={
            "skill_demand": max(0, min(100, skill_demand)),        
            "skill_breadth": max(0, min(100, skill_breadth)),      
            "market_fit": max(0, min(100, market_fit)),
            "growth_potential": max(0, min(100, growth_potential)),
        },
    )


def _compute_radar(user_skills: list[str], seniority: str, location: str,
                    peer_data: dict) -> PeerComparison:
    """Compute 6-axis radar comparing user vs peer average."""     
    # Count user skills per category -> score 0-10
    category_counts = {axis: 0 for axis in RADAR_AXES}
    for skill in user_skills:
        cat = SKILL_CATEGORY_MAP.get(skill)
        if cat and cat in category_counts:
            category_counts[cat] += 1

    # Convert to 0-10 scale (each skill adds ~2.5 points, cap at 10)
    user_values = [min(10, int(category_counts[axis] * 2.5)) for axis in RADAR_AXES]

    # Get peer averages
    peer_region = peer_data.get(seniority, {}).get(location, {})   
    if not peer_region:
        # Fallback to Mexico mid
        peer_region = peer_data.get("mid", {}).get("Mexico", {})   

    peer_avg = peer_region.get("radar_avg", {})
    peer_values = [peer_avg.get(axis, 5) for axis in RADAR_AXES]   

    # Compute percentile (rough: compare overall user sum vs peer sum)
    user_sum = sum(user_values)
    peer_sum = sum(peer_values)
    ratio = user_sum / max(peer_sum, 1)
    percentile = max(5, min(95, int(100 - ratio * 50)))

    return PeerComparison(
        axes=RADAR_AXES,
        user_values=user_values,
        peer_avg_values=peer_values,
        seniority_group=f"{seniority}-level",
        region=location,
        overall_percentile=percentile,
        percentile_label=f"Top {percentile}% of {seniority}-level LATAM developers",
    )


def _find_opportunities(user_skills: list[str], skill_data: list[dict],
                        current_salary_max: int) -> list[Opportunity]:
    """Find top 3-4 skill opportunities the user is missing."""    
    user_skills_lower = {s.lower() for s in user_skills}
    opportunities = []

    for skill_info in skill_data:
        if skill_info["skill_name"].lower() not in user_skills_lower:
            premium = skill_info["salary_premium_pct"]
            if premium > 5:  # Only show meaningful opportunities  
                salary_increase_usd = int(current_salary_max * premium / 100)
                opportunities.append(Opportunity(
                    skill=skill_info["skill_name"],
                    unlock_count=max(10, int(skill_info["job_count_estimate"] * 0.015)),
                    salary_increase_pct=premium,
                    salary_increase_usd=salary_increase_usd,       
                    demand_trend=skill_info["growth_trend"],       
                    trend_growth_pct=skill_info["growth_pct"],     
                    difficulty=skill_info["difficulty"],
                    time_to_learn=skill_info["time_to_learn"],     
                ))

    # Sort by salary premium descending, return top 4
    opportunities.sort(key=lambda o: o.salary_increase_usd, reverse=True)
    return opportunities[:4]


def _build_heatmap(skill_data: list[dict]) -> list[HeatmapEntry]:  
    """Build the demand heatmap from skill data."""
    heatmap = []
    for skill_info in skill_data:
        trend = skill_info["growth_trend"]
        if trend == "rising":
            color = "green"
        elif trend == "stable":
            color = "yellow"
        else:
            color = "red"

        heatmap.append(HeatmapEntry(
            skill=skill_info["skill_name"],
            trend=trend,
            growth_pct=skill_info["growth_pct"],
            color=color,
        ))

    # Sort: rising first, then stable, then declining
    order = {"rising": 0, "stable": 1, "declining": 2}
    heatmap.sort(key=lambda h: (order.get(h.trend, 1), -abs(h.growth_pct)))
    return heatmap[:10]


def _build_skills_analysis(user_skills: list[str], skill_data: list[dict],
                           seniority: str) -> list[SkillAnalysis]: 
    """Analyze each of the user's skills."""
    skill_data_map = {s["skill_name"]: s for s in skill_data}      
    analysis = []

    level_map = {"junior": "beginner", "mid": "intermediate", "senior": "advanced", "staff": "expert"}
    base_level = level_map.get(seniority, "intermediate")

    for skill in user_skills:
        info = skill_data_map.get(skill)
        if info:
            # High adoption = lower percentile rank (more competition)
            percentile = max(10, min(95, int(100 - info["adoption_pct"])))
            salary_impact = int(info["salary_premium_pct"] * 400)  

            analysis.append(SkillAnalysis(
                skill_name=skill,
                current_level=base_level,
                market_demand=info["growth_trend"],
                percentile_rank=percentile,
                salary_impact_usd=salary_impact,
                trend_direction=info["growth_trend"],
                trend_growth_pct=info["growth_pct"],
            ))
        else:
            # Unknown skill â€” assign reasonable defaults
            analysis.append(SkillAnalysis(
                skill_name=skill,
                current_level=base_level,
                market_demand="stable",
                percentile_rank=50,
                salary_impact_usd=3000,
                trend_direction="stable",
                trend_growth_pct=0,
            ))

    return analysis


def _generate_summary(profile: ManualProfileInput, score: int,     
                      gap: int, key_skill: str) -> str:
    """Generate a market summary text from template."""
    return (
        f"As a {profile.seniority.value}-level {profile.current_role} in {profile.location} "
        f"with {profile.years_experience} years of experience, your market readiness score is "
        f"{score}/100. Your strongest skills ({', '.join(profile.skills[:3])}) place you "
        f"competitively in the LATAM market, but your lack of {key_skill} is costing you "
        f"approximately ${gap:,} per year. The market is shifting rapidly toward cloud-native "
        f"and DevOps skills â€” adding {key_skill} would significantly increase your earning potential."
    )


def _generate_narrative(profile: ManualProfileInput) -> str:       
    """Generate a copy-paste value statement."""
    return (
        f"As a {profile.seniority.value}-level {profile.current_role.lower()} with "
        f"{profile.years_experience} years of experience, I specialize in "
        f"{', '.join(profile.skills[:3])} and deliver reliable, scalable systems. "
        f"My expertise positions me to contribute immediately to backend services "
        f"and data processing pipelines, and I am actively expanding into cloud "
        f"infrastructure to drive even greater impact for engineering teams."
    )


async def compute_diagnosis(profile: ManualProfileInput) -> DiagnosisResponse:
    """Main diagnosis computation. Pure function, no LLM calls.""" 

    salary_bands = _load_json("salary_bands.json")
    skill_data = _load_json("skill_demand.json")
    peer_data = _load_json("peer_benchmarks.json")

    # 1. Salary lookup
    current_band = _find_salary_band(
        salary_bands, profile.current_role, profile.seniority.value, profile.location
    )

    if current_band:
        current_min = current_band["salary_min_usd"]
        current_max = current_band["salary_max_usd"]
    else:
        current_min, current_max = 25000, 40000  # safe fallback   

    # 2. Find best missing skill and compute potential salary      
    opportunities = _find_opportunities(profile.skills, skill_data, current_max)
    if opportunities:
        key_missing = opportunities[0].skill
        secondary_missing = [o.skill for o in opportunities[1:3]]  
        # Potential = next seniority band or current + premium     
        potential_premium = opportunities[0].salary_increase_pct   
        potential_min = int(current_min * (1 + potential_premium / 100))
        potential_max = int(current_max * (1 + potential_premium / 100))
    else:
        key_missing = "Kubernetes"
        secondary_missing = ["CI/CD", "AWS"]
        potential_min = int(current_min * 1.3)
        potential_max = int(current_max * 1.3)

    gap_annual = potential_min - current_max
    gap_3year = gap_annual * 3

    # Job counts (realistic estimates)
    current_job_count = max(50, int(sum(
        s.get("job_count_estimate", 0) for s in skill_data
        if s["skill_name"] in profile.skills
    ) * 0.015))
    potential_job_count = current_job_count + (opportunities[0].unlock_count if opportunities else 40)
    job_increase_pct = int((potential_job_count - current_job_count) / max(current_job_count, 1) * 100)

    salary_diagnosis = SalaryDiagnosis(
        current_range=SalaryRange(min=current_min, max=current_max),
        potential_range=SalaryRange(min=potential_min, max=potential_max),
        gap_annual=max(0, gap_annual),
        gap_3year=max(0, gap_3year),
        current_job_count=current_job_count,
        potential_job_count=potential_job_count,
        job_count_increase_pct=max(0, job_increase_pct),
        key_missing_skill=key_missing,
        secondary_missing_skills=secondary_missing,
    )

    # 3. Market score
    market_score = _compute_market_score(
        profile.skills, skill_data, profile.years_experience, profile.seniority.value
    )

    # 4. Skills analysis
    skills_analysis = _build_skills_analysis(
        profile.skills, skill_data, profile.seniority.value        
    )

    # 5. Radar data
    peer_comparison = _compute_radar(
        profile.skills, profile.seniority.value, profile.location, peer_data
    )

    # 6. Heatmap
    demand_heatmap = _build_heatmap(skill_data)

    # 7. Summary texts (LLM-generated with fallback)
    try:
        market_summary = await generate_diagnosis_narrative(
            profile_skills=profile.skills,
            seniority=profile.seniority.value,
            location=profile.location,
            years_experience=profile.years_experience,
            role=profile.current_role,
            market_score=market_score.overall,
            gap_annual=salary_diagnosis.gap_annual,
            key_missing_skill=key_missing,
        )
    except Exception:
        market_summary = _generate_summary(
            profile, market_score.overall, salary_diagnosis.gap_annual, key_missing
        )

    try:
        value_narrative = await generate_value_narrative(
            role=profile.current_role,
            seniority=profile.seniority.value,
            years_experience=profile.years_experience,
            skills=profile.skills,
            market_score=market_score.overall,
        )
    except Exception:
        value_narrative = _generate_narrative(profile)

    return DiagnosisResponse(
        salary_diagnosis=salary_diagnosis,
        market_score=market_score,
        skills_analysis=skills_analysis,
        peer_comparison=peer_comparison,
        opportunities=list(opportunities),
        demand_heatmap=demand_heatmap,
        market_summary=market_summary,
        value_narrative=value_narrative,
    )
