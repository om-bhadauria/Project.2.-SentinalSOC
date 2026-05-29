from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import xgboost as xgb
import numpy as np
import os
from dataset_loader import extract_features

app = FastAPI(title="SentinelSOC Phishing Predictor")

class PredictRequest(BaseModel):
    url: str
    html: str = ""

MODEL_PATH = "model/xgb_model.json"
model = None

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = xgb.XGBClassifier()
        model.load_model(MODEL_PATH)
    else:
        print(f"Warning: Model not found at {MODEL_PATH}. Prediction will fail.")

@app.post("/predict")
def predict_url(req: PredictRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    features = extract_features(req.url)
    # Could extract features from HTML here if using advanced model
    probs = model.predict_proba(np.array([features]))[0]
    
    score = float(probs[1])
    return {
        "url": req.url,
        "phishing_score": score,
        "is_phishing": score > 0.8
    }

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}
