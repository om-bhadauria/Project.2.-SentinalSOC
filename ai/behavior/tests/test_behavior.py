from fastapi.testclient import TestClient
from app import app
import model
import os

client = TestClient(app)

def test_enroll_and_verify():
    # Setup clean models directory for test
    model.PROFILES_DIR = "test_profiles/"
    model.MODELS_DIR = "test_models/"
    model.initialize()
    
    user_id = "test_user_biometrics"
    
    # 1. Enroll
    samples = [
        {"dwell": {"median": 105.0, "stddev": 5.0}, "flight": {"median": 205.0, "stddev": 5.0}},
        {"dwell": {"median": 100.0, "stddev": 10.0}, "flight": {"median": 195.0, "stddev": 15.0}},
        {"dwell": {"median": 105.0, "stddev": 2.0}, "flight": {"median": 200.0, "stddev": 5.0}}
    ]
    
    payload = {"userId": user_id, "samples": samples}
    res = client.post("/api/behavior/enroll", json=payload)
    
    assert res.status_code == 200
    assert "Successfully enrolled" in res.json()["message"]
    
    # 2. Verify with similar timings (should be authorized / NOT anomalous)
    verify_payload_good = {
        "userId": user_id,
        "sample": {"dwell": {"median": 105.0, "stddev": 3.0}, "flight": {"median": 202.0, "stddev": 4.0}}
    }
    
    res_good = client.post("/api/behavior/verify", json=verify_payload_good)
    assert res_good.status_code == 200
    assert res_good.json()["is_anomalous"] is False
    assert res_good.json()["risk_score"] < 0.6
    
    # 3. Verify with completely different timings (Attacker)
    verify_payload_bad = {
        "userId": user_id,
        "sample": {"dwell": {"median": 300.0, "stddev": 50.0}, "flight": {"median": 490.0, "stddev": 80.0}}
    }
    
    res_bad = client.post("/api/behavior/verify", json=verify_payload_bad)
    assert res_bad.status_code == 200
    assert res_bad.json()["is_anomalous"] is True
    assert res_bad.json()["risk_score"] > 0.6
