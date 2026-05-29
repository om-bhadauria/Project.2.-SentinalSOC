# SentinelSOC Threat Model & Hardening Mitigations

This document outlines the attack surfaces associated with the SentinelSOC infrastructure, alongside the active mitigations implemented across the platform to constrain security regressions.

## 1. Attack Surfaces & Risks

### A. API Abuse and Volumetric Denial of Service (DoS)
- **Risk**: External agents flooding scanning endpoints (`/api/scan/url`), forcing expensive downstream processing hooks to VirusTotal or Machine Learning feature extractors, thereby starving resources.
- **Risk**: Huge JSON payload injection exhausting process memory.

### B. Broken Authentication & Authorization (BOLA)
- **Risk**: Unauthenticated actors hitting the React Incident dashboard pipelines (`/api/alerts`) to steal correlative data mapping organization killchains.
- **Risk**: Attackers explicitly curling the undocumented `POST /api/response/execute` to arbitrarily quarantine executives or revoke backend tokens resulting in self-inflicted lateral downtime.

### C. Cross-Origin Resource Sharing (CORS) Drift
- **Risk**: If the `Access-Control-Allow-Origin` header is incorrectly wildcarded (`*`), any malicious Javascript domain can trigger CSRF attacks requesting native actions against the local SOC node.

## 2. Active Mitigations & Security Posture

### Layer 1: Access Constraints (Express)
- **Rate Limiters (`express-rate-limit`)**: Strict thresholds exist. Unauthenticated APIs carry a 100 req/ 15 min bound, whereas expensive AI endpoints (like URL scanning) are tightly bracketed to 10 req/ minute.
- **Payload Bounds**: Express Body Parsers drop any `application/json` packet larger than exactly `100kb`.
- **CORS Allowlist**: CORS origins are strictly bound against `.env` maps (`CORS_ORIGIN=http://localhost:5173`). No wildcard domains are accepted.
- **Helmet Headers**: `helmet()` natively scrambles `X-Powered-By` headers and executes strict XSS framing logic over all downstream HTTP calls.

### Layer 2: Role-Based Identity (RBAC)
- **JWT Assertions**: No Admin layer (`/api/alerts`, `/api/response/*`) will execute without an explicitly validated JWT Bearer token mapped to the `admin` Role scope.
- **Biometric Quarantining**: The exact initial `/api/login` route checks `responseService` state immediately. Correlated compromised IDs drop HTTP 403 blocks dynamically before validation rules even read payloads.

### Layer 3: Incident Traceability (Audit Logs)
- **Winston JSON Formatter (`auditLogger.js`)**: All high-risk automated SOC responses natively inject strict JSON metrics into `logs/audit.json`. Each action attaches a unique `correlationId` tracking state across isolated subsystems.

### Layer 4: Demo Isolation (`docker-compose.override.yml`)
- To prevent external leaks during security review sessions, `.env` definitions like `VT_API_KEY` are aggressively stubbed empty in testing. The docker daemon runs offline fallbacks preserving demo killchain repeatability without phoning-home metadata to open sources.
