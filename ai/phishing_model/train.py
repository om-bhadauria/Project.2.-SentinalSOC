import os
import argparse
import numpy as np
import xgboost as xgb
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score, precision_score, recall_score
from sample_data_loader import DataLoader
from features import FeatureExtractor

MODEL_DIR = "model/"

def prepare_data(source='dummy', file_path='data/dataset.csv'):
    loader = DataLoader()
    if source == 'dummy':
        df = loader.generate_dummy_data(samples=2000)
    else:
        df = loader.load_local_csv(file_path)
        
    print(f"Loaded {len(df)} samples.")
    
    extractor = FeatureExtractor()
    X = []
    y = df['label'].values
    
    print("Extracting features (this may take a moment)...")
    for url in df['url']:
        X.append(extractor.extract_all(url))
        
    return np.array(X), y

def train(X, y, save_path=MODEL_DIR):
    os.makedirs(save_path, exist_ok=True)
    
    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save scaler
    scaler_path = os.path.join(save_path, 'scaler.joblib')
    joblib.dump(scaler, scaler_path)
    
    # Train XGBoost
    print("Training XGBoost...")
    model = xgb.XGBClassifier(
        n_estimators=100, 
        learning_rate=0.1, 
        max_depth=5, 
        eval_metric='logloss',
        use_label_encoder=False
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    print("\n--- Evaluation Metrics ---")
    preds = model.predict(X_test_scaled)
    probs = model.predict_proba(X_test_scaled)[:, 1]
    
    print(f"Accuracy:  {accuracy_score(y_test, preds):.4f}")
    print(f"Precision: {precision_score(y_test, preds):.4f}")
    print(f"Recall:    {recall_score(y_test, preds):.4f}")
    print(f"AUC:       {roc_auc_score(y_test, probs):.4f}")
    print("\nClassification Report:\n", classification_report(y_test, preds))
    
    # Save Model
    model_path = os.path.join(save_path, 'xgb_model.json')
    model.save_model(model_path)
    print(f"Model saved to {model_path} and Scaler to {scaler_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=str, default='dummy', choices=['dummy', 'csv'], help="Data source type")
    parser.add_argument('--file', type=str, default='data/dataset.csv', help="Path to csv if source is csv")
    args = parser.parse_args()
    
    X, y = prepare_data(args.source, args.file)
    train(X, y)
