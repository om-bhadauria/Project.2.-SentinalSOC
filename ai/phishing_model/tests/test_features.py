import pytest
from features import FeatureExtractor

def test_extract_lexical_features():
    extractor = FeatureExtractor()
    # Good URL
    f1 = extractor._extract_lexical("https://www.google.com")
    assert f1['is_https'] == 1
    assert f1['has_ip_in_domain'] == 0
    assert f1['suspicious_tokens'] == 0
    
    # Bad URL
    f2 = extractor._extract_lexical("http://192.168.1.1/login.php?verify=1")
    assert f2['is_https'] == 0
    assert f2['has_ip_in_domain'] == 1
    assert f2['suspicious_tokens'] >= 2

def test_extract_html_features():
    extractor = FeatureExtractor()
    f = extractor._extract_html("<html><body><form></form><script>eval()</script></body></html>")
    assert f['html_has_form'] == 1
    assert f['html_suspicious_js'] == 1
    
def test_extract_all_length():
    extractor = FeatureExtractor()
    res = extractor.extract_all("https://example.com/test", "")
    assert len(res) == len(extractor.feature_names)
