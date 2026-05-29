import json
import xgboost as xgb
from dataset_loader import extract_features
import argparse

def predict(url, model_path='model/xgb_model.json'):
    features = extract_features(url)
    model = xgb.XGBClassifier()
    model.load_model(model_path)
    # XGBoost expects 2D array
    import numpy as np
    probs = model.predict_proba(np.array([features]))[0]
    return probs[1] # Probability of being class 1 (phishing)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', type=str, required=True, help='URL to scan')
    parser.add_argument('--model', type=str, default='model/xgb_model.json')
    args = parser.parse_args()
    
    score = predict(args.url, args.model)
    print(json.dumps({"url": args.url, "phishing_score": float(score)}))
