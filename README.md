# PayLens — AI-Powered Fair Mirror for LATAM Engineers

PayLens is a comprehensive platform designed to help software engineers in Latin America understand their true market value through data-driven analysis and interactive tools. It provides a "fair mirror" of their skills, seniority, and salary potential, moving beyond traditional benchmarks.

## 🚀 Project Overview

The platform consists of a Python-based backend powered by FastAPI and a modern React/Next.js frontend. It leverages deterministic market data alongside LLM-powered insights to provide actionable career advice and negotiation simulation.

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework.
- **LiteLLM**: Multi-provider LLM orchestration (Groq, Gemini, Ollama) with automatic failover.
- **Pydantic v2**: Robust data validation and serialization.
- **uv**: Next-generation Python package installer and resolver.

### Frontend
- **Next.js 14**: React framework for production-grade applications.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **shadcn/ui**: High-quality, accessible UI components.
- **Recharts**: Composative charting library for data visualization.
- **Framer Motion**: Production-ready motion library for React.

## 🏗️ Architecture & Features

The project has been developed in several key stages:

1.  **BE-01: Scaffold & Models**: Initial project setup with basic architecture and Pydantic schemas.
2.  **BE-02: Profile Endpoints**: Support for both GitHub-based skill detection and manual profile entry.
3.  **BE-03: Diagnosis Engine**: Core deterministic logic for calculating market scores, salary benchmarks, and identifying skill gaps based on LATAM-specific data.
4.  **BE-04: LLM Service**: Centralized AI service layer with robust fallbacks and failover between local and cloud providers.
5.  **BE-05: What-If Simulator**: Interactive tool to project the market impact of adding or removing specific skills in real-time.
6.  **BE-06: Negotiation Simulator**: Interactive AI-driven salary negotiation simulator with company-specific personas (MercadoLibre, Nubank, Globant, Rappi) and post-negotiation analysis reports.

## 🚦 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- `uv` (Python package manager)

### Backend Setup
```bash
cd backend
# Install dependencies
uv pip install -r requirements.txt
# Set up environment variables
cp .env.example .env
# Start the server
uv run uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
# Install dependencies
npm install
# Start development server
npm run dev
```

## 📖 Documentation

- Detailed API documentation can be found in the [Backend README](./backend/README.md).
- Interactive API documentation is available at `http://localhost:8000/docs` when the backend is running.
