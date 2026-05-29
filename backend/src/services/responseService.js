const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const metricsService = require('./metricsService');

// Fallback safety settings
const AUTO_TTL_MS = 10 * 60 * 1000; // 10 minutes auto-lock
const PERMANENT_TTL = Infinity;

class ResponseService {
  constructor() {
    this.blockedUsers = new Map();
    this.quarantinedDevices = new Map();
    this.revokedTokens = new Map();
    this.auditLog = [];
    
    // Config toggles
    this.autoEnabled = process.env.AUTO_RESPONDER_ENABLED === 'true';
    this.dryRun = process.env.DRY_RUN !== 'false'; // default true for safety
  }

  getConfig() {
    return {
      autoEnabled: this.autoEnabled,
      dryRun: this.dryRun
    };
  }

  updateConfig(config) {
    if (typeof config.autoEnabled === 'boolean') this.autoEnabled = config.autoEnabled;
    if (typeof config.dryRun === 'boolean') this.dryRun = config.dryRun;
    logger.info(`Response Config Updated: Auto=${this.autoEnabled}, DryRun=${this.dryRun}`);
    return this.getConfig();
  }

  // --- Core Executions ---

  async executeAction(action, payload, isAuto = false) {
    // Determine explicit TTL overrides from payload, fallback to defaults
    const ttl = (payload.ttl && payload.ttl > 0) ? payload.ttl : (isAuto ? AUTO_TTL_MS : PERMANENT_TTL);
    const expiresAt = ttl === Infinity ? Infinity : Date.now() + ttl;
    
    let isDryRun = this.dryRun;
    // Manual triggers natively skip Dry Run enforcement, auto triggers strictly respect it
    if (!isAuto) isDryRun = false; 

    const logEntry = {
      timestamp: Date.now(),
      action,
      payload,
      isAuto,
      isDryRun,
      expiresAt,
      reversiblePath: null
    };

    if (isDryRun) {
      logger.info(`[DRY RUN] Would execute: ${action} on ${JSON.stringify(payload)} TTL: ${ttl}`);
      this.auditLog.push(logEntry);
      logAudit(action, 'SUCCESS_DRY_RUN', 'system', { isAuto, payload, expiresAt });
      return logEntry;
    }

    switch(action) {
      case 'block_login':
        if (!payload.userId) throw new Error("Missing userId for block_login");
        // Generate Reversible Token
        const unlockToken = crypto.randomBytes(16).toString('hex');
        this.blockedUsers.set(payload.userId, { expiresAt, reason: payload.reason || "Auto-mitigation", isAuto, unlockToken });
        logEntry.reversiblePath = `Unlock Token generated: ${unlockToken}`;
        logger.warn(`RuleAction: User ${payload.userId} login blocked. Unlock Token: ${unlockToken} (Auto: ${isAuto})`);
        break;

      case 'quarantine_device':
        if (!payload.deviceId) throw new Error("Missing deviceId for quarantine_device");
        const liftToken = crypto.randomBytes(8).toString('hex');
        this.quarantinedDevices.set(payload.deviceId, { expiresAt, reason: payload.reason || "Auto-mitigation", isAuto, liftToken });
        logEntry.reversiblePath = `Quarantine Lift Token generated: ${liftToken}`;
        logger.warn(`RuleAction: Device ${payload.deviceId} quarantined (Auto: ${isAuto})`);
        break;

      case 'revoke_tokens':
        if (!payload.userId) throw new Error("Missing userId for revoke_tokens");
        this.revokedTokens.set(payload.userId, { expiresAt });
        logger.warn(`RuleAction: Tokens revoked for user ${payload.userId} (Auto: ${isAuto})`);
        break;
        
      case 'send_admin_notification':
        logger.error(`[SEC-OP ALERT] Incident Notification sent for Incident ID: ${payload.incidentId || 'Generic'}`);
        break;
        
      case 'warn_user':
        logger.warn(`[USER UI WARNING] Rendered modal warning logic for user target: ${payload.userId}`);
        break;
        
      case 'notify_email':
        logger.warn(`[MAIL QUEUE] Dispatching identity verification email for user target: ${payload.userId}`);
        break;
        
      case 'log_event':
        logger.info(`[HUNTING LOG] Annotated Persistent Context Marker for Investigation IDs: ${payload.incidentId}`);
        break;
        
      case 'lift_user_block':
        this.blockedUsers.delete(payload.userId);
        logger.info(`[OVERRIDE] Lifted user block for: ${payload.userId}`);
        break;
        
      case 'lift_device_quarantine':
        this.quarantinedDevices.delete(payload.deviceId);
        logger.info(`[OVERRIDE] Lifted device quarantine for: ${payload.deviceId}`);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    metricsService.incrementAction();
    this.auditLog.push(logEntry);
    this.cleanupState(); // garbage collect expired
    
    // JSON Audit Dump
    logAudit(action, 'SUCCESS', 'system', { isAuto, payload, expiresAt, reversiblePath: logEntry.reversiblePath });
    
    return logEntry;
  }

  async autoMitigate(incident) {
    if (!this.autoEnabled) {
      logger.info(`Auto-Responder Disabled. Skipping response logic for incident: ${incident.id}`);
      return;
    }

    logger.info(`Evaluating playbook Auto-Mitigations for scale: [${incident.severity}] incident: ${incident.id}`);
    
    const playbookPath = path.join(__dirname, '..', '..', 'data', 'playbooks', `${incident.severity}.json`);
    if (!fs.existsSync(playbookPath)) {
        logger.warn(`No explicit playbook found for severity level: ${incident.severity}`);
        return;
    }
    
    const playbookDesc = JSON.parse(fs.readFileSync(playbookPath, 'utf8'));
    const actions = [];
    
    for (const rule of playbookDesc) {
        // Build Target Payloads
        const payload = { incidentId: incident.id, reason: `Playbook Automation: ${incident.severity}` };
        if (rule.ttl > 0) payload.ttl = rule.ttl;
        
        if (incident.user && incident.user !== 'anonymous') {
            payload.userId = incident.user;
        }

        // Assuming device IDs might be passed in rule triggers natively
        // As a fallback hunt through triggers for generic quarantine logic
        let targetDeviceId = null;
        if (incident.triggers) {
            incident.triggers.forEach(t => {
                if (t.matched_events) {
                    t.matched_events.forEach(e => {
                        if (e.deviceId) targetDeviceId = e.deviceId;
                    });
                }
            });
        }
        if (targetDeviceId) payload.deviceId = targetDeviceId;

        try {
            actions.push(this.executeAction(rule.action, payload, true));
        } catch (e) {
            logger.warn(`Playbook ${rule.action} explicitly skipped (Missing targets)`);
        }
    }

    await Promise.allSettled(actions);
  }

  // --- Lookups & Enforcement ---

  isUserBlocked(userId) {
    this.cleanupState();
    return this.blockedUsers.has(userId);
  }

  isDeviceQuarantined(deviceId) {
    this.cleanupState();
    return this.quarantinedDevices.has(deviceId);
  }

  // Admin Override (Human resolves incident)
  liftBlock(userId) {
    this.executeAction('lift_user_block', { userId }, false);
  }

  liftQuarantine(deviceId) {
    this.executeAction('lift_device_quarantine', { deviceId }, false);
  }

  getAuditLogs() {
    return this.auditLog;
  }

  // --- Internal ---
  cleanupState() {
    const now = Date.now();
    for (let [k, v] of this.blockedUsers) {
      if (now > v.expiresAt) this.blockedUsers.delete(k);
    }
    for (let [k, v] of this.quarantinedDevices) {
      if (now > v.expiresAt) this.quarantinedDevices.delete(k);
    }
    for (let [k, v] of this.revokedTokens) {
      if (now > v.expiresAt) this.revokedTokens.delete(k);
    }
  }
}

module.exports = new ResponseService();
