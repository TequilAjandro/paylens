from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="PayLens API",
    description="AI-Powered Fair Mirror for LATAM Engineers",
    version="1.0.0",
)

# CORS — allow all origins for hackathon speed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from routers import profile, diagnosis, whatif, negotiate

app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(diagnosis.router, prefix="/api", tags=["Diagnosis"])
app.include_router(whatif.router, prefix="/api", tags=["What-If"])    
app.include_router(negotiate.router, prefix="/api", tags=["Negotiate"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
