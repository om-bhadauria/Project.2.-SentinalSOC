# SentinelSOC Demo Playbooks

Designed for reliable, deterministic presentations. This playbook bypasses external APIs and forces the correlation engine into highly controlled demonstration paths.

## 1. Environment Preparation
Ensure all three microservices are up and running perfectly out of standard terminal panes or Docker.

### Start Backend (Node)
```bash
cd backend
npm run dev
```
*(Runs on `http://localhost:4000`)*

### Start Behavioral ML (Python)
```bash
cd ai/behavior
source .venv/bin/activate
uvicorn app:app --port 8000
```
*(Runs on `http://localhost:8000`)*

### Start Phishing ML (Python)
```bash
cd ai/phishing_model
source .venv/bin/activate
uvicorn serve:app --port 8001
```
*(Runs on `http://localhost:8001`)*

### Start Frontend Dashboard (React)
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 2. Running The Live Attack Scenario

With all Services and the Frontend Browser window open, trigger the orchestrator script. 
This script precisely mimics a hacker penetrating the layers.

```bash
cd scripts
./run_demo.sh
```

### What Happens (Backend View):
1. **Phishing Execution (Click)**: `run_demo` sends an explicit POST simulating user `jdoe_finance` clicking `http://evil.com/phish`. VT Service explicitly overrides and registers *15 Positives*. The Correlator Engine logs the `phish_click` silently. 
2. **Device Spoofing**: `run_demo` immediately forces `dev-hacker-99x` to register into the device fingerprinting registry masked behind IP `192.168.1.55`.
3. **Stolen Credential Login**: The attacker forces a login attempt mimicking `jdoe_finance`. Correlator logs a `new_device` event dynamically into the 60-min sliding window. 
4. **Behavioral Shift**: The ML SVM simulator triggers `behavior_anomaly`.

### What You Should See (Dashboard View):
- An explicit **Incident Detection Event** will instantly pop onto the WebSocket Live Feed stream.
- Severity will be highlighted natively as **`HIGH`** because (`phish_click` + `new_device`) breached the 0.8 Score.
- **Incident Velocity Chart**: Will violently spike up to nearly `1.0`.
- **Auto-Mitigation Active**: A green pill icon will state the Incident was `Auto-Mitigated`. 
- **Active Enforcements Panel**: Will show Login Blocks active and Session Revocations running in the exact timeline.

If you don't want to wait the 10 seconds for the timeline to play out, append the `--fast` flag.
```bash
./run_demo.sh --fast
```
