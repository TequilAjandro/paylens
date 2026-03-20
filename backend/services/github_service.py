import httpx
import os
import json
from pathlib import Path


GITHUB_API_BASE = "https://api.github.com"
DATA_DIR = Path(__file__).parent.parent / "data"

# Language -> skill mapping for detection
LANGUAGE_SKILL_MAP = {
    "Python": ["Python"],
    "JavaScript": ["JavaScript"],
    "TypeScript": ["TypeScript"],
    "Java": ["Java"],
    "Go": ["Go"],
    "Rust": ["Rust"],
    "Ruby": ["Ruby"],
    "PHP": ["PHP"],
    "C#": ["C#"],
    "Kotlin": ["Kotlin"],
    "Swift": ["Swift"],
    "Shell": ["Linux", "Bash"],
    "HCL": ["Terraform"],
    "Dockerfile": ["Docker"],
}

# Repo topic -> skill mapping
TOPIC_SKILL_MAP = {
    "react": "React",
    "nextjs": "Next.js",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "gcp": "GCP",
    "azure": "Azure",
    "postgresql": "PostgreSQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "graphql": "GraphQL",
    "nodejs": "Node.js",
    "express": "Express",
    "vue": "Vue",
    "angular": "Angular",
    "tailwindcss": "Tailwind",
    "machine-learning": "Machine Learning",
    "deep-learning": "Machine Learning",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "ci-cd": "CI/CD",
}


ROLE_INFERENCE_MAP = {
    "Frontend": ["React", "Angular", "Vue", "Next.js", "Tailwind"],
    "Backend": ["FastAPI", "Django", "Spring", "Express", "Node.js"],
    "DevOps": ["Docker", "Kubernetes", "Terraform", "AWS", "GCP", "Azure"],
    "Data": ["Pandas", "Spark", "Kafka", "PostgreSQL", "MongoDB"],
    "AI/ML": ["TensorFlow", "PyTorch", "Machine Learning", "Scikit-learn"],
}


def _infer_role(sorted_languages: list[tuple[str, int]], detected_skills: set[str]) -> str:
    category_scores: dict[str, int] = {}
    for category, skills in ROLE_INFERENCE_MAP.items():
        category_scores[category] = sum(1 for s in skills if s in detected_skills)

    top_category = max(category_scores, key=category_scores.get) if category_scores else "Backend"
    top_score = category_scores.get(top_category, 0)

    if top_score == 0:
        if sorted_languages:
            primary_lang = sorted_languages[0][0]
            if primary_lang in ("JavaScript", "TypeScript"):
                return "Frontend Developer"
            elif primary_lang in ("Python", "Java", "Go", "Rust", "PHP", "Ruby", "C#"):
                return "Backend Developer"
        return "Software Engineer"

    role_names = {
        "Frontend": "Frontend Developer",
        "Backend": "Backend Developer",
        "DevOps": "DevOps Engineer",
        "Data": "Data Engineer",
        "AI/ML": "ML Engineer",
    }
    return role_names.get(top_category, "Software Engineer")


async def fetch_github_profile(username: str) -> dict:
    """Fetch user profile, repos, and languages from GitHub API.   
    Returns structured data or raises an exception on failure."""  

    async with httpx.AsyncClient(timeout=15.0) as client:
        headers = {"Accept": "application/vnd.github.v3+json"}     
        token = os.getenv("GITHUB_TOKEN")
        if token:
            headers["Authorization"] = f"token {token}"

        # Fetch user info
        user_resp = await client.get(
            f"{GITHUB_API_BASE}/users/{username}", headers=headers 
        )
        user_resp.raise_for_status()
        user_data = user_resp.json()

        # Fetch repos
        repos_resp = await client.get(
            f"{GITHUB_API_BASE}/users/{username}/repos",
            headers=headers,
            params={"per_page": 100, "sort": "updated"},
        )
        repos_resp.raise_for_status()
        repos = repos_resp.json()

        # Fetch languages for up to 30 repos
        all_languages: dict[str, int] = {}
        all_topics: list[str] = []

        for repo in repos[:30]:
            # Collect topics
            all_topics.extend(repo.get("topics", []))

            try:
                lang_resp = await client.get(
                    f"{GITHUB_API_BASE}/repos/{username}/{repo['name']}/languages",
                    headers=headers,
                )
                lang_resp.raise_for_status()
                langs = lang_resp.json()
                for lang, byte_count in langs.items():
                    all_languages[lang] = all_languages.get(lang, 0) + byte_count
            except Exception:
                continue

        # Compute language percentages
        total_bytes = sum(all_languages.values()) or 1
        sorted_languages = sorted(all_languages.items(), key=lambda x: -x[1])

        primary_languages = []
        for lang, byte_count in sorted_languages[:10]:
            pct = round(byte_count / total_bytes * 100, 1)
            repos_with_lang = sum(
                1 for r in repos if lang in (r.get("language") or "")
            )
            primary_languages.append({
                "language": lang,
                "percentage": pct,
                "repos_count": max(repos_with_lang, 1),
            })

        # Detect skills from languages
        detected_skills: set[str] = set()
        for lang, _ in sorted_languages:
            if lang in LANGUAGE_SKILL_MAP:
                detected_skills.update(LANGUAGE_SKILL_MAP[lang])

        # Detect skills from topics
        unique_topics = set(all_topics)
        for topic in unique_topics:
            topic_lower = topic.lower()
            if topic_lower in TOPIC_SKILL_MAP:
                detected_skills.add(TOPIC_SKILL_MAP[topic_lower])  

        # Estimate seniority
        created_at = user_data.get("created_at", "")
        if created_at:
            from datetime import datetime
            created_year = datetime.fromisoformat(
                created_at.replace("Z", "+00:00")
            ).year
            years_active = max(1, 2026 - created_year)
        else:
            years_active = 2

        if years_active >= 8 and len(repos) >= 40:
            estimated_seniority = "senior"
        elif years_active >= 4 and len(repos) >= 15:
            estimated_seniority = "mid"
        else:
            estimated_seniority = "junior"

        # Build notable patterns
        notable_patterns = []
        top_lang = sorted_languages[0][0] if sorted_languages else "Unknown"
        notable_patterns.append(f"Primary language: {top_lang}")   

        has_devops = any(
            t in unique_topics
            for t in ["docker", "kubernetes", "aws", "gcp", "terraform", "ci-cd"]
        )
        if not has_devops and "Dockerfile" not in all_languages:   
            notable_patterns.append("No cloud/DevOps infrastructure repos detected")
        else:
            notable_patterns.append("Has DevOps/infrastructure experience")

        if len(repos) > 20:
            notable_patterns.append("Active contributor with many repositories")

        # Build profile summary
        profile_summary = (
            f"{estimated_seniority.capitalize()}-level developer with "
            f"{years_active} years of activity. "
            f"Primary focus on {top_lang} across {len(repos)} repositories. "
            f"Detected skills: {', '.join(sorted(detected_skills)[:8])}."
        )

        return {
            "username": username,
            "detected_skills": sorted(list(detected_skills)),
            "primary_languages": primary_languages,
            "estimated_seniority": estimated_seniority,
            "years_active": years_active,
            "total_repos": len(repos),
            "total_commits_last_year": user_data.get("public_repos", 0) * 15,  # rough estimate
            "notable_patterns": notable_patterns,
            "profile_summary": profile_summary,
            "location": user_data.get("location") or "",
            "inferred_role": _infer_role(sorted_languages, detected_skills),
        }


def get_mock_carlos_profile() -> dict:
    """Return pre-built mock data for demo user Carlos."""
    mock_path = DATA_DIR / "mock_github_carlos.json"
    if mock_path.exists():
        with open(mock_path, "r") as f:
            raw = json.load(f)

        # Transform raw GitHub API format into the processed output format
        repos = raw.get("repos", [])
        total_repos = len(repos)

        # Build primary_languages from contribution_stats
        langs_used = raw.get("contribution_stats", {}).get("languages_used", {})
        total_lang_bytes = sum(langs_used.values()) or 1
        primary_languages = []
        for lang, bytes_count in sorted(langs_used.items(), key=lambda x: -x[1])[:10]:
            pct = round(bytes_count / total_lang_bytes * 100, 1)
            repos_with_lang = sum(1 for r in repos if r.get("language") == lang)
            primary_languages.append({
                "language": lang,
                "percentage": pct,
                "repos_count": max(repos_with_lang, 1),
            })

        # Build notable patterns
        notable_patterns = []
        top_lang = primary_languages[0]["language"] if primary_languages else "Unknown"
        notable_patterns.append(f"Primary language: {top_lang}")

        has_devops = any(
            t in raw.get("repos", [{}])
            for t in ["docker", "kubernetes", "aws", "gcp", "terraform", "ci-cd"]
        )
        if not has_devops:
            notable_patterns.append("No cloud/DevOps infrastructure repos detected")
        else:
            notable_patterns.append("Has DevOps/infrastructure experience")

        if total_repos > 20:
            notable_patterns.append("Active contributor with many repositories")

        return {
            "username": raw.get("username", "carlos-dev"),
            "detected_skills": raw.get("detected_skills", []),
            "primary_languages": primary_languages,
            "estimated_seniority": raw.get("estimated_seniority", "mid"),
            "years_active": raw.get("years_active", 3),
            "total_repos": total_repos,
            "total_commits_last_year": raw.get("contribution_stats", {}).get("total_commits_last_year", 347),
            "notable_patterns": notable_patterns,
            "profile_summary": raw.get("profile_summary", ""),
            "location": raw.get("location", "Mexico City, Mexico"),
            "inferred_role": "Backend Developer",
        }

    # Inline fallback if file doesn't exist
    return {
        "username": "carlos-dev",
        "detected_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "React", "SQL"],
        "primary_languages": [
            {"language": "Python", "percentage": 45.0, "repos_count": 12},
            {"language": "JavaScript", "percentage": 30.0, "repos_count": 8},
            {"language": "TypeScript", "percentage": 15.0, "repos_count": 4},
            {"language": "HTML", "percentage": 5.0, "repos_count": 6},
            {"language": "Shell", "percentage": 5.0, "repos_count": 3},
        ],
        "estimated_seniority": "mid",
        "years_active": 3,
        "total_repos": 24,
        "total_commits_last_year": 347,
        "notable_patterns": [
            "Strong API development focus",
            "No cloud/DevOps infrastructure repos",
            "Active open-source contributor",
        ],
        "profile_summary": "Mid-level backend developer with strong Python focus. API-first development style. Notable gap in cloud/DevOps infrastructure.",
        "location": "Mexico City, Mexico",
        "inferred_role": "Backend Developer",
    }
