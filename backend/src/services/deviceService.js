const logger = require('../utils/logger');
const queueService = require('./queueService');

// In-Memory Device Store for Demo
// Maps deviceId -> { firstSeen, lastSeen, ipHistory, users, expectedTimezone, agentHistory }
const deviceRegistry = new Map();

class DeviceService {
  async registerAndEvaluate(userId, deviceId, metadata, ip) {
    if (!deviceId) return { error: "No device ID provided" };

    const now = Date.now();
    let riskScore = 0.0;
    const reasons = [];

    const isNewDevice = !deviceRegistry.has(deviceId);

    let deviceRec = {};
    if (isNewDevice) {
      riskScore += 0.4;
      reasons.push("Brand new device identifier seen for the first time.");
      
      deviceRec = {
        firstSeen: now,
        lastSeen: now,
        ipHistory: new Set([ip]),
        users: new Set([userId]),
        expectedTimezone: metadata.timezone || 'unknown',
        agentHistory: new Set([metadata.userAgent || 'unknown'])
      };
    } else {
      deviceRec = deviceRegistry.get(deviceId);
      
      // Heuristic 1: Multiple Users on One Device (potential bot or shared cafe)
      if (userId !== 'anonymous' && !deviceRec.users.has(userId)) {
        riskScore += 0.2;
        reasons.push("New user logging into existing device.");
        deviceRec.users.add(userId);
      }

      // Heuristic 2: Inconsistent Timezone
      if (metadata.timezone && metadata.timezone !== deviceRec.expectedTimezone) {
         riskScore += 0.5;
         reasons.push(`Timezone mismatch! Expected ${deviceRec.expectedTimezone}, got ${metadata.timezone}. Potential VPN/Proxy or spoofing.`);
      }

      // Heuristic 3: Mismatching User-Agent
      if (metadata.userAgent && !deviceRec.agentHistory.has(metadata.userAgent)) {
         riskScore += 0.3;
         reasons.push("User-Agent changed for this device identifier context.");
         deviceRec.agentHistory.add(metadata.userAgent);
      }

      // Record IP change
      if (!deviceRec.ipHistory.has(ip)) {
        riskScore += 0.1;
        reasons.push("Device accessed from a new IP.");
        deviceRec.ipHistory.add(ip);
      }

      deviceRec.lastSeen = now;
    }

    deviceRegistry.set(deviceId, deviceRec);
    
    const maxRisk = Math.min(riskScore, 1.0);
    logger.debug(`Device evaluated. Score: ${maxRisk}. Reasons: ${reasons.join(' | ')}`);

    // Only alert on particularly high initial evaluation scores for now
    if (maxRisk >= 0.7) {
       await queueService.publish('HIGH_RISK_DEVICE', {
         userId,
         deviceId,
         reasons,
         score: maxRisk,
         ip
       });
    }

    return {
      score: maxRisk,
      isNew: isNewDevice,
      reasons: reasons.length ? reasons : ["Normal device usage patterns"]
    };
  }
}

module.exports = new DeviceService();
