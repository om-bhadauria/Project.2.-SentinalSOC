import re
import urllib.parse
from bs4 import BeautifulSoup
import whois
from datetime import datetime

class FeatureExtractor:
    def __init__(self):
        self.feature_names = [
            'url_length',
            'digit_count',
            'subdomain_count',
            'suspicious_tokens',
            'is_https',
            'has_ip_in_domain',
            'domain_age_days',
            'html_has_form',
            'html_suspicious_js'
        ]

    def _extract_lexical(self, url):
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc

        url_length = len(url)
        digit_count = sum(c.isdigit() for c in url)
        
        # Subdomain approx: split by '.' and subtract default domain parts (e.g., example.com -> 2 parts)
        parts = domain.split('.')
        subdomain_count = max(0, len(parts) - 2)

        # Common phishing keywords in URL
        suspicious_words = ['login', 'verify', 'update', 'secure', 'account', 'bank', 'confirm']
        suspicious_tokens = sum(1 for word in suspicious_words if word in url.lower())

        is_https = 1 if parsed.scheme == 'https' else 0
        has_ip_in_domain = 1 if re.match(r'\d+\.\d+\.\d+\.\d+', domain) else 0

        return {
            'url_length': url_length,
            'digit_count': digit_count,
            'subdomain_count': subdomain_count,
            'suspicious_tokens': suspicious_tokens,
            'is_https': is_https,
            'has_ip_in_domain': has_ip_in_domain
        }

    def _extract_host(self, url):
        """ Stubbed WHOIS / Host checks """
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc
        
        age_days = -1
        # For performance, only do actual WHOIS optionally or if domain isn't an IP.
        # Uncomment in production for actual heavy processing:
        # try:
        #     if not re.match(r'\d+\.\d+\.\d+\.\d+', domain):
        #        w = whois.whois(domain)
        #        if w.creation_date:
        #             creation = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
        #             delta = datetime.now() - creation
        #             age_days = delta.days
        # except Exception:
        #     pass

        return {
            'domain_age_days': age_days  # -1 indicates unknown/error
        }

    def _extract_html(self, html_content):
        if not html_content:
            return {'html_has_form': 0, 'html_suspicious_js': 0}
            
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            has_form = 1 if len(soup.find_all('form')) > 0 else 0
            
            # Simple heuristic for suspicious JS: e.g. eval()
            suspicious_js = 1 if 'eval(' in html_content.lower() or 'document.write' in html_content.lower() else 0
            
            return {
                'html_has_form': has_form,
                'html_suspicious_js': suspicious_js
            }
        except Exception:
            return {'html_has_form': -1, 'html_suspicious_js': -1}

    def extract_all(self, url, html=""):
        lex = self._extract_lexical(url)
        host = self._extract_host(url)
        ht = self._extract_html(html)
        
        # Combine in order of feature_names
        combined = {**lex, **host, **ht}
        return [combined[f] for f in self.feature_names]

