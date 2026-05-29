import pytest
from dataset_loader import extract_features

def test_extract_features():
    features = extract_features("https://www.google.com")
    assert len(features) == 5
    # Length, special_chars, has_ip, is_https, subdomains
    assert features[3] == 1 # is_https

def test_extract_features_ip():
    features = extract_features("http://192.168.1.1/login")
    assert features[2] == 1 # has_ip
    assert features[3] == 0 # is_https
