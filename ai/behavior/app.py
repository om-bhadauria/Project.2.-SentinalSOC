from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import model

app = FastAPI(title="SentinelSOC Behavioral Biometrics")

# Privacy-by-design setting
BEHAVIOR_STORE_RAW = os.getenv("BEHAVIOR_STORE_RAW", "false").lower() == "true"

class FeatureStats(BaseModel):
    median: float
    stddev: float

class KeystrokeSample(BaseModel):
    dwell: FeatureStats
    flight: FeatureStats

class EnrollRequest(BaseModel):
    userId: str
    samples: List[KeystrokeSample]

class VerifyRequest(BaseModel):
    userId: str
    sample: KeystrokeSample

@app.on_event("startup")
def startup():
    model.initialize()

@app.post("/api/behavior/enroll")
def enroll(req: EnrollRequest):
    if len(req.samples) < 3:
        raise HTTPException(status_code=400, detail="At least 3 samples are required to enroll a stable baseline.")
        
    sample_dicts = [{"dwell": s.dwell.dict(), "flight": s.flight.dict()} for s in req.samples]
    profile = model.enroll_profile(req.userId, sample_dicts, store_raw=BEHAVIOR_STORE_RAW)
    return {
        "userId": req.userId,
        "message": f"Successfully enrolled with {profile['num_samples']} aggregated samples."
    }

@app.post("/api/behavior/verify")
def verify(req: VerifyRequest):
    s_dict = {"dwell": req.sample.dwell.dict(), "flight": req.sample.flight.dict()}
    result = model.verify_profile(req.userId, s_dict)
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
        
    return {
        "userId": req.userId,
        "similarity_score": 1.0 - result["score"], # invert risk to similarity
        "risk_score": result["score"],
        "is_anomalous": result["is_anomalous"],
        "details": result["details"]
    }

@app.get("/")
@app.get("/health")
@app.get("/healthz")
def health():
    return {"status": "ok", "service": "BehavioralBiometrics & URLEnrichment"}

class PredictRequest(BaseModel):
    url: str

@app.post("/predict")
def predict_url(req: PredictRequest):
    # Lightweight lexical heuristic for demo purposes
    url_lower = req.url.lower()
    score = 15
    confidence = 0.90
    explain = "URL format appears safe based on superficial pattern checks."
    
    suspicious_patterns = ['.xyz', '.cc', 'login', 'verify', 'update-account', 'free-', 'secure-']
    
    if any(p in url_lower for p in suspicious_patterns):
        score = 88
        confidence = 0.85
        explain = "Lexical analysis flagged suspicious tokens often associated with credential harvesting and phishing attacks."
    
    return {
        "score": score,
        "confidence": confidence,
        "explain": explain
    }
