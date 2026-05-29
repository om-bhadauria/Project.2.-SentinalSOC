import os
import joblib
import xgboost as xgb
import argparse
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from dataset_loader import load_data

def train(source='dummy', model_dir='model/'):
    os.makedirs(model_dir, exist_ok=True)
    print(f"Loading data from {source}...")
    X, y = load_data(source)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Classifier...")
    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
    model.fit(X_train, y_train)
    
    print("Evaluating...")
    preds = model.predict(X_test)
    print(classification_report(y_test, preds))
    
    model_path = os.path.join(model_dir, 'xgb_model.json')
    # Save the model
    model.save_model(model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=str, default='dummy', help='Data source: dummy or csv')
    args = parser.parse_args()
    train(args.source)
