# Gemini - Paylens

This document provides a comprehensive overview of the Paylens project, designed to give Gemini context for effective collaboration.

## Project Overview

Paylens is a web application with a Python-based backend and a frontend (currently under development).

### Backend

The backend is built using the **FastAPI** framework, a modern, high-performance web framework for building APIs with Python.

- **Dependencies**: The project uses `uv` for dependency management. Key libraries include:
    - `fastapi`: For building the API.
    - `uvicorn`: As the ASGI server.
    - `pydantic`: For data validation.
    - `litellm`: For interacting with LLMs.
    - `httpx`: For making HTTP requests.
    - `python-dotenv`: For managing environment variables.

### Frontend

The frontend directory is currently empty.

**TODO**: Add information about the frontend once it's developed.

## Building and Running

### Backend

To run the backend server, use the following command:

```bash
uvicorn main:app --reload
```

**Note**: The `main.py` file currently only contains a placeholder. This command assumes the FastAPI app instance is named `app` in `main.py`.

## Development Conventions

- The backend uses `uv` for dependency management. To install dependencies, run:
  ```bash
  uv pip install -r requirements.txt
  ```
- Environment variables are managed with `.env` files and `python-dotenv`.
