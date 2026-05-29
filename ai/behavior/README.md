# SentinelSOC: Behavioral Biometrics Engine

A lightweight, privacy-preserving microservice to authenticate and verify user keystroke dynamics dynamically alongside passwords.

## Privacy By Design
A foundational pillar of this behavioral analyzer is protecting Private Identifiable Information (PII) of end users. 
Unlike legacy security keystroke loggers, **raw password timing arrays are never transmitted over the network and are completely obscured mathematically.**

- **Edge-Computed Distillations**: The web-client uses `client_js_snippet.js` to natively digest sequential `keydown/keyup` buffers into secure scalar geometry (specifically, Median and Standard Deviation metrics).
- **Ephemeral Native Scope**: Timing vectors are destroyed continuously on Form Submit; the network only receives mathematical summaries.
- **No Raw Storage**: The backend defaults `BEHAVIOR_STORE_RAW=false`. Even if raw timelines are sent via testing APIs, the backend strictly rejects saving anything but generalized profile coordinates (centroids).

## Architecture
- FastAPI framework exposes `/enroll` and `/verify`
- Profiles are bounded around deterministic `Cosine Distance` boundaries, mapped against explicitly trained statistical `centroids`.
- Dynamic fallback checks enforce tight variance guardrails (i.e., if typing Standard Deviation drastically mismatches, standard alerts flag HIGH).

## Requirements
```bash
BEHAVIOR_STORE_RAW=false # Set to true ONLY if collecting offline datasets, DO NOT use in prod.
```

### Endpoints
`POST /api/behavior/enroll`: Seed the math. Requires at least `3 samples` directly to build a meaningful centroid baseline. 
`POST /api/behavior/verify`: Match a single typing payload. The API yields `similarity_score` and deterministic `is_anomalous` triggers matching rule engines.
