# SentinelSOC Backend

Core Node.js/Express ecosystem orchestrating the Security APIs.

## Correlator Engine Tuning

The `rulesEngine.js` has been upgraded to a fully deterministic, JSON-pluggable correlation engine running local state boundaries mapped against explicit actions.
Its core weights and triggers act as the foundation for Threat Modeling severity thresholds, natively overriding or absorbing ML metrics.

### Tuning Weights
You can tune the weights freely inside `backend/data/rules.json`.
The total `score` bounds mapped by standard triggers maxes out dynamically. 
Scores map internally to:
- `< 0.6` = LOW
- `> 0.6` = MEDIUM
- `>= 0.8` = HIGH (Triggers Auto-Mitigations)

Consider:
- Single anomalous interactions (e.g. `phish_click` = weight `0.8` natively jumps directly into HIGH Incident territory).
- A combined logic attack `failed_loginx3` = weight `0.5`, requiring further compromise to breach into HIGH alerts.

### Setting ML Enrichments
The correlation engine supports an `ml_enrichment` boost. If the root payload event contains natively generated AI predictions `{ "risk_score": 0.9 }`, the `rulesEngine` automatically parses it and assigns a max `< +0.3 >` score multiplier across the entire rolling event timeline. 
This forces edge-case MEDIUM events into auto-mitigation HIGH scenarios when the ML models express certainty on an attack surface that purely deterministic rules bounded off.

**Performance Impact:** The JSON dictionary structure iterates `O(C)` per sliding window, meaning complex arrays run instantly over 10k/sec bounds inside native Node.js event heaps.
