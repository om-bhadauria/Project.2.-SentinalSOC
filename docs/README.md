# SentinelSOC
**AI-driven Micro Security Operations Center**

SentinelSOC is an open-source, lightweight Security Operations Center tailored for small organizations. It provides real-time monitoring, machine learning-driven threat detection, and an intuitive administrative dashboard to immediately flag suspicious activities without requiring complex, enterprise-grade SIEM setup.

## Features
- **Phishing URL Detection System**: Extensible XGBoost ML model to classify malicious URLs based on lexical features, complemented by a VirusTotal API integration stub.
- **Keystroke Dynamics (Behavior AI)**: Monitors typing patterns to create "profiles" for users. Detects anomalous typing velocity during login, indicating potential credential stuffing or account takeover.
- **Rule-based Correlation Engine**: Aggregates disparate events (e.g. impossible travel within 1 hour, or multiple failed logins within 5 minutes) into single, prioritized alerts.
- **Real-time Alerting Dashboard**: Built on React, Tailwind, and FingerprintJS to provide SOC analysts with instant insights, geographic visualizations (placeholder concept), and manual URL scanning.

---

## Architecture Diagram

```ascii
     [ Victim Client / Attacker ]
               |
        +------+------+  FingerprintJS
        |  Frontend   +----------------+
        |  (React)    |                |
        +------+------+                |
               |                       v
               +-----------+     [ Backend API (Node.js/Express) ]
                           |       (JWT, Helmet, Rate Limits)
                           |               |
               +-----------+---------------+------------+
               |                           |            |
       [ User Actions ]            [ Rules Engine ]     |
      (Login, Keystroke)           (Correlation)        |
               |                           |            |
    +----------V----------+     +----------V----------+ |
    |  AI Keystroke Svc   |     | Redis Event Queue   | |
    |  (Python/FastAPI)   |     | (or In-memory)      | |
    +---------------------+     +---------------------+ |
                                                        |
                                            +-----------V-----------+
                                            |  AI Phishing Svc      |-----> (VirusTotal API)
                                            |  (Python/FastAPI)     |
                                            +-----------------------+
```

## Threat Model & Limitations
**Threats Mitigated:**
- Credential stuffing (caught via rate limits and repetitive logic rules).
- Account Takeover by manual intruders (caught via keystroke dynamics and fast-travel rules).
- Naive Phishing attempts (caught via ML lexical string matching and VT integration).

**Limitations (Do Not Use in Prod As-Is):**
1. **Secrets**: JWT secrets and VirusTotal API keys are currently defaulted or empty. Make sure to define them securely using environment variables (`.env`).
2. **Database**: Scan jobs and alerts are backed by PostgreSQL, and incident/demo data can use MongoDB. The lightweight demo auth store is file-based and should be replaced with a real identity provider before production use.
3. **Behavior Model**: The keystroke model uses simple z-score distance on dwell and flight times and must act over HTTPS to be securely captured.
4. **Phishing Data**: The datasets loaded currently rely on dummy generic arrays until true Kaggle/Mendeley feeds are mapped locally via CSV.

---

## Quickstart (Docker Demo)

The entire SentinelSOC stack can be brought up locally via `docker-compose`.

### Prerequisites
- Docker & Docker Compose
- (Optional) VirusTotal API Key

### Running Locally
1. Navigate to the project directory:
   ```bash
   cd e:/scsit/SentinelSOC
   ```
2. (Optional) Set your `VT_API_KEY` inside `docker-compose.yml` backend environment variables.
3. Execute the demo setup script:
   ```bash
   chmod +x infra/setup_demo.sh
   ./infra/setup_demo.sh
   ```
   *Alternatively, just run `docker-compose -f infra/docker-compose.yml up --build`.*

4. Access the Dashboard:
   - URL: `http://localhost:3000`
   - Login: `admin@sentinel.soc` / the `DEMO_ADMIN_PASS` value from `.env`

### Manual Execution Paths
If running outside of Docker:
- **Backend:** `cd backend && npm install && npm start` (Starts on port 4000)
- **Frontend:** `cd frontend && npm install && npm run dev` (Starts on port 5173)
- **AI Phishing:** `cd ai/phishing_model && pip install -r requirements.txt && uvicorn app:app --port 8000`
- **AI Behavior:** `cd ai/behavior && pip install -r requirements.txt && uvicorn app:app --port 8001`

*(Note: API integration points assume localhost mappings based on the codebase's preset constants unless configured otherwise).*
