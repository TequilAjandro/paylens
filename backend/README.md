# PayLens Backend

PayLens is an AI-powered API designed to help LATAM engineers understand their market value and negotiate better salaries.

## Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/latest/)
- **LLM Integration**: [LiteLLM](https://docs.litellm.ai/)
- **HTTP Client**: [httpx](https://www.python-httpx.org/)
- **Dependency Management**: [uv](https://github.com/astral-sh/uv)
- **Environment Management**: [python-dotenv](https://saurabh-kumar.com/python-dotenv/)

## Requirements

- Python 3.12 or higher.
- `uv` installed on your system.

## Installation

To set up the development environment, navigate to the `backend/` directory and run:

```bash
uv pip install -r requirements.txt
```

This will install all necessary dependencies within your virtual environment.

## Configuration

Copy the `.env.example` file to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Available environment variables:
- `GROQ_API_KEY`: API key for Groq models.
- `GEMINI_API_KEY`: API key for Google Gemini models.
- `OLLAMA_HOST`: Host for Ollama local inference (default: http://localhost:11434).

## Running the API

To start the development server with auto-reload:

```bash
uv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Directory Structure

- `main.py`: Entry point of the FastAPI application.
- `models/`: Pydantic schemas for request/response validation.
- `routers/`: API route definitions (Profile, Diagnosis, What-If, Negotiate).
- `services/`: Business logic and external service integrations.
- `data/`: Mock data and static assets.
