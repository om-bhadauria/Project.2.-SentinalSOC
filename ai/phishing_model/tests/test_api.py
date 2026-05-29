from fastapi.testclient import TestClient
from serve import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    # Before the model is trained, 'ready' might be false
    assert "status" in response.json()

def test_predict_endpoint_no_model():
    # Attempting to predict before model is loaded properly returns 503
    response = client.post("/predict", json={"url": "http://test.com"})
    # Either returns 503, or if the dummy model was trained during docker build, 200.
    assert response.status_code in [200, 503]
