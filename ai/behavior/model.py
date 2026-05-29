import numpy as np
import json
import os
import joblib
from scipy.spatial.distance import cosine

PROFILES_DIR = "profiles/"
MODELS_DIR = "models/"

def initialize():
    os.makedirs(PROFILES_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)

def _extract_features(sample: dict):
    """
    Standardize the input to a fixed-length feature vector.
    We read explicitly calculated median and stddev from the frontend to preserve PII semantics.
    """
    dwell = sample.get('dwell', {'median': 0, 'stddev': 0})
    flight = sample.get('flight', {'median': 0, 'stddev': 0})
    
    features = [
        dwell.get('median', 0), dwell.get('stddev', 0),
        flight.get('median', 0), flight.get('stddev', 0)
    ]
    # Replace nans with 0
    return np.nan_to_num(features, nan=0.0).tolist()

def enroll_profile(user_id: str, samples: list, store_raw=False):
    """
    Takes a list of samples (multiple password typings) to build a baseline.
    Requires at least 3 samples to build a reasonable stability engine.
    """
    feature_matrix = []
    
    for sample in samples:
        feature_matrix.append(_extract_features(sample))
        
    feature_matrix = np.array(feature_matrix)
    
    # Store the centroid for cosine distance
    centroid = np.mean(feature_matrix, axis=0).tolist()
    
    profile = {
        'centroid': centroid,
        'num_samples': len(samples)
    }
    
    if store_raw:
        profile['raw_samples'] = samples
    
    with open(os.path.join(PROFILES_DIR, f"{user_id}.json"), "w") as f:
        json.dump(profile, f)
        
    return profile

def verify_profile(user_id: str, sample: dict):
    """
    Returns an anomaly score (0 to 1). Higher means more anomalous.
    Uses Lightweight Cosine Distance against Centroids.
    """
    profile_path = os.path.join(PROFILES_DIR, f"{user_id}.json")
    if not os.path.exists(profile_path):
        return {"error": "Profile not found", "score": 1.0, "is_anomalous": True, "details": {}}
        
    with open(profile_path, "r") as f:
        profile = json.load(f)
        
    features = _extract_features(sample)
    
    # 1. Cosine Distance
    # cosine returns distance from 0 to 2 (0=identical, 2=opposite)
    cos_dist = cosine(features, profile['centroid'])
    if np.isnan(cos_dist): cos_dist = 1.0
    
    # Normalize cosine distance to a 0-1 risk score (heuristically capped)
    cos_risk = min(cos_dist / 0.1, 1.0) 
    
    # 2. Simple Threshold Fallback
    # Check if the variance scale dynamically diverges from standard bounds.
    std_diff = abs(features[1] - profile['centroid'][1]) + abs(features[3] - profile['centroid'][3])
    threshold_risk = min(std_diff / 50.0, 1.0)
    
    # Combine risk metrics
    final_score = (cos_risk * 0.7) + (threshold_risk * 0.3)
    
    return {
        "score": round(float(final_score), 4),
        "is_anomalous": float(final_score) > 0.6,
        "details": {
            "cosine_distance": round(float(cos_dist), 4),
            "threshold_penalty": round(float(threshold_risk), 4)
        }
    }
