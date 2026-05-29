# SentinelSOC AI Phishing Detection Microservice

This microservice provides Machine Learning (XGBoost) capabilities to detect Phishing URLs using Lexical, Host-based, and HTML feature extraction methodologies.

## Setup & Requirements

- Python 3.11
- Virtual Environment recommended.

```bash
cd ai/phishing_model
python -m venv .venv
# Activate depending on OS:
# Windows: .venv\Scripts\activate
# Unix: source .venv/bin/activate

pip install -r requirements.txt
```

## Dataset Acquisition

The model is designed to natively ingest CSV files sourced from popular open Kaggle/Mendeley datasets containing phishing and legitimate URLs.

**Recommended Datasets:**
1. [Kaggle - Web page phishing detection dataset](https://www.kaggle.com/datasets/shashwatwork/web-page-phishing-detection-dataset) 
2. [Mendeley Data - Phishing Websites](https://data.mendeley.com/datasets/c2gw7fy2j4/1)

### Using the Data
1. Download a dataset CSV.
2. Place it in `ai/phishing_model/data/dataset.csv`.
3. The `DataLoader` class in `sample_data_loader.py` handles reading the standard target labels. If the dataset column is not named `status` or standard binary `1/0`, you may need to map it in `sample_data_loader.py`.

## Quickstart Testing Commands

If you do not have datasets available, you can generate **dummy data** to test the system pipeline.

**1. Train the Model**
```bash
python train.py --source dummy
```
*This will generate `model/xgb_model.json` and `model/scaler.joblib`.*

**2. Start the Inference Server (FastAPI)**
```bash
uvicorn serve:app --reload --port 8000
```
*The API is now available at `http://localhost:8000/predict` and Swagger UI is at `http://localhost:8000/docs`.*

**3. Run a Quick CLI Test (Bypass the webserver)**
```bash
python cli_test.py --test-url "http://secure-login-update.com/login"
```

**4. Run Pytest Suite**
```bash
pytest tests/
```

## Features Analyzed
- **Lexical:** URL length, digit frequency, number of subdomains, presence of Suspicious keywords (login, bank, secure, confirm), IP addresses masking as domains.
- **Host (Optional):** Integration space for WHOIS age.
- **HTML (Optional):** If the frontend provides HTML, checks for form elements and suspicious JS executions (`eval()`).
