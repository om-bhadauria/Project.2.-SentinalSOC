const logger = require('../utils/logger');
const responseService = require('./responseService');
const metricsService = require('./metricsService');
const { logAudit } = require('../utils/auditLogger');
const mongoose = require('mongoose');
let IncidentModel = null;
try { IncidentModel = require('../models/Incident'); } catch(e) {}

// Pluggable Rule Engine configuration (JSON format)
const path = require('path');
const fs = require('fs');
let rulesConfig = [];
try {
  rulesConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/rules.json'), 'utf-8'));
} catch (e) {
  logger.warn("Failed to load rules.json, using empty ruleset.");
}

class CorrelatorEngine {
  constructor() {
    this.incidents = [];
    this.eventWindow = new Map(); // userId -> array of events
    this.SLIDING_WINDOW_MS = 60 * 60 * 1000; // 60 mins
    this.io = null;
  }

  setSocketIo(ioInstance) {
    this.io = ioInstance;
    logger.info("Socket.io attached to Correlator Engine.");
  }

  async getAlerts() {
    if (mongoose.connection.readyState === 1 && IncidentModel) {
        const docs = await IncidentModel.find().lean();
        return docs.sort((a, b) => b.timestamp - a.timestamp);
    }
    return this.incidents.sort((a, b) => b.timestamp - a.timestamp);
  }

  async evaluate(rawEvent) {
    logger.debug(`Correlator processing: ${rawEvent.type}`);
    const now = Date.now();
    
    if (this.io) {
        this.io.emit('raw_event', { ...rawEvent, system_time: now });
    }

    // Normalize event into a standard format for the rule engine
    let user = 'anonymous';
    let action = rawEvent.type.toLowerCase();
    const eventId = `evt-${now}-${Math.random().toString(36).substr(2, 5)}`;

    if (rawEvent.type === 'LOGIN_ATTEMPT') {
      user = rawEvent.payload.userId || user;
      action = rawEvent.payload.success ? 'successful_login' : 'failed_login';
    } else if (rawEvent.type === 'USER_ACTIVITY') {
      user = rawEvent.payload.userId || user;
      action = rawEvent.payload.eventType.toLowerCase();
    } else if (rawEvent.type === 'MALICIOUS_URL_SCANNED') {
      action = 'malicious_url_scanned';
    } else if (rawEvent.type === 'HIGH_RISK_DEVICE') {
      user = rawEvent.payload.userId || user;
      action = 'high_risk_device_alert';
    } else if (rawEvent.type === 'BEHAVIOR_ANOMALY') {
      user = rawEvent.payload.userId || user;
      action = 'behavior_anomaly';
    }

    if (!user) return;

    // Append to sliding window
    const history = this.eventWindow.get(user) || [];
    history.push({ id: eventId, action, time: now, raw: rawEvent });
    
    // Prune old events outside window
    const prunedHistory = history.filter(e => now - e.time <= this.SLIDING_WINDOW_MS);
    this.eventWindow.set(user, prunedHistory);

    await this._runRules(user, prunedHistory);
  }

  async _runRules(user, history) {
    let totalScore = 0.0;
    const triggers = [];
    const recommended_actions = new Set();
    const involvedEvents = history.map(h => h.id);

    // Evaluate all pluggable JSON rules against the current window
    for (const rule of rulesConfig) {
      const requirements = {};
      rule.conditions.forEach(c => {
         requirements[c] = (requirements[c] || 0) + 1;
      });

      let ruleMatched = true;
      let matchedEvents = [];
      const historyCopy = [...history]; 
      
      for (const req in requirements) {
         const needed = requirements[req];
         const found = [];
         for(let i=0; i<historyCopy.length; i++) {
             if(historyCopy[i] && historyCopy[i].action === req) {
                 found.push(historyCopy[i].id);
                 historyCopy[i] = null; // consume event
                 if(found.length === needed) break;
             }
         }
         if (found.length < needed) {
             ruleMatched = false;
             break;
         } else {
             matchedEvents.push(...found);
         }
      }

      if (ruleMatched) {
        totalScore += rule.weight;
        triggers.push({
           rule: rule.id,
           weight: rule.weight,
           matched_events: matchedEvents
        });
        if (rule.recommended_actions) {
            rule.recommended_actions.forEach(a => recommended_actions.add(a));
        }
      }
    }

    // ML Enrichment Check (e.g. url_score from ML only increases score)
    let mlEnrichmentScore = 0;
    history.forEach(e => {
        const payload = e.raw.payload || {};
        const meta = payload.metadata || {};
        const mlScore = meta.ml_score || meta.url_score || meta.risk_score || payload.risk_score || 0;
        if (mlScore > 0 && typeof mlScore === 'number') {
            const boost = mlScore * 0.3; // max +0.3 boost
            if (boost > mlEnrichmentScore) {
                mlEnrichmentScore = boost;
            }
        }
    });

    if (mlEnrichmentScore > 0) {
        totalScore += mlEnrichmentScore;
        triggers.push({
            rule: "ml_enrichment",
            weight: parseFloat(mlEnrichmentScore.toFixed(2)),
            matched_events: involvedEvents 
        });
    }

    if (totalScore > 0) {
      this._generateIncident(user, totalScore, triggers, Array.from(recommended_actions), involvedEvents);
      this.eventWindow.set(user, []); 
    }
  }

  _generateIncident(user, score, triggers, recommended_actions, events) {
    let severity = 'LOW';
    if (score > 0.6) severity = 'MEDIUM';
    if (score >= 0.8) severity = 'HIGH';

    const incident = {
      id: `INC-${Date.now()}`,
      timestamp: Date.now(),
      status: 'OPEN',
      user,
      severity,
      score: Math.min(score, 1.0).toFixed(2),
      triggers: triggers,
      recommended_actions: recommended_actions,
      involved_events: events
    };

    this.incidents.push(incident);
    metricsService.incrementIncident();
    logger.warn(`INCIDENT DETECTED [${severity}] - User: ${user} - Score: ${incident.score}`);

    if (mongoose.connection.readyState === 1 && IncidentModel) {
       IncidentModel.create(incident).catch(e => logger.error("MongoDB persistence error", e));
    }

    // JSON Audit Tracing
    logAudit('INCIDENT_GENERATED', 'SUCCESS', 'system', { incidentId: incident.id, severity, score, user });

    if (this.io) {
      this.io.emit('new_incident', incident);
    }
    
    // Safety Net Auto-Mitigation
    if (severity === 'HIGH') {
      responseService.autoMitigate(incident).catch(err => logger.error("Auto mitigate failed", err));
    }
  }
}

module.exports = new CorrelatorEngine();
