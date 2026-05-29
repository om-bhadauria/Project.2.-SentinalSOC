import os
import pandas as pd
import numpy as np
import requests

class DataLoader:
    """
    Loads samples from Mendeley / Kaggle styled open datasets.
    Kaggle 'Phishing Site URLs' or 'Web page phishing detection' CSV structure assumed.
    Columns expected: 'url', 'status' ('phishing'/'legitimate' or 1/0)
    """
    def __init__(self, use_vt=False, vt_api_key=None):
        self.use_vt = use_vt
        self.vt_api_key = vt_api_key or os.getenv('VT_API_KEY')
        
    def load_local_csv(self, filepath):
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Dataset {filepath} not found. Please download expected CSV to data/ dir.")
        print(f"Loading dataset from {filepath}...")
        df = pd.read_csv(filepath)
        
        # Standardize target column
        # Adapt here based on the exact dataset downloaded
        if 'status' in df.columns:
            df['label'] = df['status'].apply(lambda x: 1 if str(x).lower() == 'phishing' else 0)
        elif 'Result' in df.columns:
             # some datasets use -1 for phishing, 1 for legit, etc. Adjusting to binary 0/1
             df['label'] = df['Result'].apply(lambda x: 1 if x == -1 else 0)
        elif 'label' not in df.columns:
            # Assumed last col is target
            target_col = df.columns[-1]
            df['label'] = df[target_col].apply(lambda x: 1 if x in ['phishing', 'bad', 1, '1'] else 0)
            
        return df
        
    def generate_dummy_data(self, samples=1000):
        print(f"Generating {samples} dummy samples for demonstration...")
        urls = [
            f"http://{'evil' if i%2==0 else 'good'}{i}.com/path?login={'true' if i%2==0 else 'false'}"
            for i in range(samples)
        ]
        labels = [1 if i%2==0 else 0 for i in range(samples)]
        return pd.DataFrame({'url': urls, 'label': labels})
        
    def enrich_with_vt(self, url):
        """
        Optional enrichment from VirusTotal.
        Used to seed the DB with known malicious metrics if required.
        """
        if not self.use_vt or not self.vt_api_key:
            return {"vt_score": 0}
            
        # Simplified VirusTotal V3 integration mapping
        try:
             import base64
             url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
             headers = {"x-apikey": self.vt_api_key}
             resp = requests.get(f"https://www.virustotal.com/api/v3/urls/{url_id}", headers=headers, timeout=5)
             if resp.status_code == 200:
                 stats = resp.json().get('data', {}).get('attributes', {}).get('last_analysis_stats', {})
                 score = stats.get('malicious', 0)
                 return {"vt_score": score}
        except Exception as e:
            print(f"VT Error for {url}: {e}")
        return {"vt_score": 0}
