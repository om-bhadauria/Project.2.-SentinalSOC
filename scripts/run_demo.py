#!/usr/bin/env python3
import json
import time
import argparse
import requests
import sys

BACKEND_URL = "http://localhost:4000"
SCENARIO_FILE = "../seed/demo_scenario.json"

def check_health():
    try:
        res = requests.get(f"{BACKEND_URL}/healthz", timeout=2)
        if res.status_code == 200:
            print("[+] Backend /healthz is UP")
            return True
        else:
            print("[-] Backend /healthz returned non-200")
            return False
    except requests.ConnectionError:
        print("[-] Fatal: Backend is unreachable. Please start it on port 4000.")
        return False

def run_scenario(fast_mode=False):
    with open(SCENARIO_FILE, 'r') as f:
        data = json.load(f)

    print(f"\n==========================================")
    print(f"Executing: {data['scenario']}")
    print(f"Actor Scope: {data['actors']}")
    print(f"Mode: {'FAST' if fast_mode else 'REALTIME'}")
    print(f"==========================================\n")

    for step in data['sequence']:
        print(f"-> Step {step['step']}: {step['name']}")
        
        headers = {'Content-Type': 'application/json'}
        if 'override_ip' in step:
            # Fake the real IP header for express heuristics
            headers['x-forwarded-for'] = step['override_ip']

        url = f"{BACKEND_URL}{step['endpoint']}"
        try:
            req = requests.post(url, json=step['payload'], headers=headers)
            if req.status_code in [200, 201]:
                print(f"   [OK] {req.status_code} - {req.json().get('message') or 'Success'}")
            else:
                print(f"   [WARN] {req.status_code} - {req.text}")
        except Exception as e:
            print(f"   [ERROR] Connection refused processing step {step['step']}")
            sys.exit(1)

        if not fast_mode:
            delay = int(step.get('delay_ms', 0)) / 1000.0
            if delay > 0:
                print(f"   (Waiting {delay}s...)")
                time.sleep(delay)

    print("\n[+] Demo Execution Complete.")
    print("-> Check the React Dashboard! You should see a highly visible AUTO-MITIGATED incident.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser("SentinelSOC Reliable Demo Runner")
    parser.add_argument("--fast", action="store_true", help="Bypass all delays and inject immediately")
    args = parser.parse_args()

    if check_health():
        run_scenario(fast_mode=args.fast)
