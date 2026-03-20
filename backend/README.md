# PayLens Backend

The PayLens backend is a high-performance FastAPI application that powers market analysis, salary benchmarking, and negotiation simulation for LATAM engineers.

## 🚀 Key Features

- **GitHub Analysis**: Automatically detects skills, languages, and estimates seniority from a GitHub profile.
- **Deterministic Diagnosis**: Core logic driven by real LATAM market data (Salary bands, Skill demand).
- **Interactive Simulation**: "What-If" analysis to project the value of learning new skills.
- **Negotiation Simulator**: AI-powered hiring manager personas for realistic salary negotiation practice.
- **Fail-Safe AI**: Multi-provider LLM orchestration with automatic failover to local models (Ollama) or hardcoded fallbacks.

## 🛠️ Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/latest/)
- **LLM Orchestration**: [LiteLLM](https://docs.litellm.ai/)
- **Dependency Management**: [uv](https://github.com/astral-sh/uv) 

## 🔌 API Reference

### Profile Management
- `POST /api/profile/github`: Analyzes a GitHub username or URL to extract technical skills and seniority.
- `POST /api/profile/manual`: Validates and initializes a user profile from manual input.

### Market Analysis
- `POST /api/diagnosis`: The core engine. Calculates market scores, salary benchmarks, and identifies the highest-impact skill opportunities.
- `POST /api/what-if`: Simulates the market impact (score, salary, jobs) of adding or removing specific skills.

### Negotiation Simulator
- `POST /api/negotiate`: One turn of an interactive negotiation with a company-specific AI persona.
- `POST /api/negotiate/report`: Generates a detailed analysis of a completed negotiation, identifying what worked and what didn't.

## 📁 Directory Structure

```text
backend/
├── data/               # Market data (Salary bands, skill demand, etc.)
├── models/             # Pydantic request/response schemas
├── prompts/            # System prompts for AI personas and analysis
├── routers/            # FastAPI route definitions
├── services/           # Core business logic (Diagnosis, LLM, Negotiation)
└── main.py             # Application entry point
```

## 🚦 Getting Started

### Installation
```bash
uv pip install -r requirements.txt
```

### Configuration
Create a `.env` file from `.env.example`:
- `GROQ_API_KEY`: For fast inference.
- `GEMINI_API_KEY`: For high-quality analysis.
- `OLLAMA_HOST`: For local fallback (optional).

### Running
```bash
uv run uvicorn main:app --reload
```

Interactive documentation is available at `/docs`.

## 🐳 Docker

Build and run from the **repo root**:

```bash
docker compose build
docker compose up -d
```

The backend is available at `http://localhost:8000`. Health check: `http://localhost:8000/health`.

For hot-reload dev mode:
```bash
docker compose -f docker-compose.dev.yml up
```
