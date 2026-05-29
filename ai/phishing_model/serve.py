from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import xgboost as xgb
import joblib
import numpy as np
import os
from features import FeatureExtractor

app = FastAPI(title="SentinelSOC Phishing Predictor")

class PredictRequest(BaseModel):
    url: str
    html: str = ""

MODEL_PATH = "model/xgb_model.json"
SCALER_PATH = "model/scaler.joblib"

model = None
scaler = None
extractor = FeatureExtractor()

@app.on_event("startup")
def load_artifacts():
    global model, scaler
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = xgb.XGBClassifier()
        model.load_model(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("Model and scaler loaded successfully.")
    else:
        print(f"Warning: Artifacts not found. Please train the model first.")

def get_feature_contributions(raw_features, scaled_features):
    booster = model.get_booster()
    dmatrix = xgb.DMatrix(scaled_features)
    # Returns (1, num_features + 1), last column is bias
    contribs = booster.predict(dmatrix, pred_contribs=True)[0]
    
    # Map feature names to their contributions (excluding bias)
    feat_contribs = []
    for i, fname in enumerate(extractor.feature_names):
        val = float(contribs[i])
        feat_contribs.append({"feature": fname, "contribution": val, "raw_value": float(raw_features[i])})
    
    # Sort by absolute contribution magnitude
    feat_contribs.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    return feat_contribs, float(contribs[-1])

def heuristic_fallback(url: str, raw_features: list):
    feat_dict = dict(zip(extractor.feature_names, raw_features))
    score = 0.1
    if feat_dict.get('subdomain_count', 0) > 2: score += 0.3
    if feat_dict.get('is_https', 1) == 0: score += 0.2
    if feat_dict.get('has_ip_in_domain', 0) == 1: score += 0.4
    if feat_dict.get('suspicious_tokens', 0) > 0: score += 0.3
    return min(score, 1.0)

@app.post("/predict")
def predict_url(req: PredictRequest):
    if not model or not scaler:
        # Fallback if service not fully started
        raw_features = extractor.extract_all(req.url, req.html)
        score = heuristic_fallback(req.url, raw_features)
        return {"url": req.url, "score": score, "is_phishing": score > 0.5, "explain": ["Service down: used deterministic lexical heuristic."], "source": "heuristic"}
    
    raw_features = extractor.extract_all(req.url, req.html)
    scaled_features = scaler.transform([raw_features])
    
    probs = model.predict_proba(scaled_features)[0]
    score = float(probs[1]) # probability of class 1 (phishing)
    
    # If confidence is low (close to 0.5), use heuristic fallback
    if 0.4 < score < 0.6:
        h_score = heuristic_fallback(req.url, raw_features)
        return {"url": req.url, "score": h_score, "is_phishing": h_score > 0.5, "explain": ["Low model confidence: used deterministic lexical heuristic."], "source": "heuristic"}

    # Calculate Top 3 explanations
    contributions, _ = get_feature_contributions(raw_features, scaled_features)
    explanations = [f"{c['feature']} contribution: {round(c['contribution'], 3)}" for c in contributions[:3]]

    return {
        "url": req.url,
        "score": round(score, 4),
        "is_phishing": score > 0.8,
        "explain": explanations,
        "source": "model"
    }

@app.post("/api/ai/explain")
def explain_url(req: PredictRequest):
    if not model or not scaler:
        raise HTTPException(status_code=503, detail="Model artifacts not loaded.")
        
    raw_features = extractor.extract_all(req.url, req.html)
    scaled_features = scaler.transform([raw_features])
    
    contributions, bias = get_feature_contributions(raw_features, scaled_features)
    
    return {
        "url": req.url,
        "top_features": contributions[:5],
        "bias": bias
    }

@app.get("/health")
@app.get("/healthz")
def health():
    return {"status": "ok", "ready": model is not None and scaler is not None, "service": "PhishingPredictor"}
