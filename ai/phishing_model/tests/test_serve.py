import pytest
from fastapi.testclient import TestClient
from serve import app, get_feature_contributions, load_artifacts
import serve 
import math

client = TestClient(app)

def test_explainability_sums_to_log_odds():
    # Explicitly fire FastAPI startup routines
    load_artifacts()
    
    # If the environment is still missing artifacts, skip execution
    if serve.model is None or serve.scaler is None:
        pytest.skip("Model or Scaler not loaded. Skipping explainability validation.")
        
    url = "http://secure-login-update-auth-target.com/login"
    
    # 1. Get exact model probability
    raw_features = serve.extractor.extract_all(url, "")
    scaled_features = serve.scaler.transform([raw_features])
    probs = serve.model.predict_proba(scaled_features)[0]
    score = float(probs[1]) 
    
    # Calculate the margin (log odds) from probability 
    # margin = \ln(p / (1 - p))
    # Note: If score is exactly 1.0 or 0.0, clip it to avoid div zero
    safe_score = max(min(score, 0.999999), 0.000001)
    expected_margin = math.log(safe_score / (1.0 - safe_score))
    
    # 2. Get feature contributions (SHAP margin values)
    contributions, bias = get_feature_contributions(raw_features, scaled_features)
    
    # 3. Sum contributions
    total_contribution = sum([c['contribution'] for c in contributions])
    calculated_margin = total_contribution + bias
    
    # 4. Assert mathematical convergence (SHAP sum + base_value == margin)
    assert math.isclose(expected_margin, calculated_margin, rel_tol=1e-3, abs_tol=1e-3), \
        f"SHAP Explainer sum {calculated_margin} did not match model margin {expected_margin}"

def test_explain_endpoint():
    res = client.post("/api/ai/explain", json={"url": "http://test.com", "html": ""})
    if res.status_code == 503:
        pytest.skip("Model not loaded.")
        
    assert res.status_code == 200
    data = res.json()
    assert "top_features" in data
    assert "bias" in data
    assert len(data["top_features"]) <= 5 # Only Top 5 extracted usually
