import os
import pandas as pd
import numpy as np

def load_data(source='dummy'):
    """
    Load dataset from Kaggle/Mendeley/OpenPhish or use dummy data for testing.
    Returns X (features) and y (labels).
    """
    if source == 'dummy':
        # Generate some synthetic data representing URL features
        # Features: [length, special_chars_count, has_ip, is_https, subdomains_count]
        np.random.seed(42)
        X = np.random.rand(100, 5) * 10
        y = np.random.randint(0, 2, 100)
        return pd.DataFrame(X, columns=['length', 'special_chars', 'has_ip', 'is_https', 'subdomains']), pd.Series(y)
    
    elif source == 'csv' and os.path.exists('data/dataset.csv'):
        # For an actual dataset download
        df = pd.read_csv('data/dataset.csv')
        # Assuming last column is the label
        X = df.iloc[:, :-1]
        y = df.iloc[:, -1]
        return X, y
    
    else:
        raise ValueError("Unknown source or data not found.")

def extract_features(url: str):
    """
    Feature extraction for a single URL at inference time.
    """
    import re
    length = len(url)
    special_chars = len(re.findall(r'[^a-zA-Z0-9]', url))
    has_ip = 1 if re.search(r'\d+\.\d+\.\d+\.\d+', url) else 0
    is_https = 1 if url.startswith('https') else 0
    subdomains = url.split('://')[-1].split('/')[0].count('.')
    
    return [length, special_chars, has_ip, is_https, subdomains]
