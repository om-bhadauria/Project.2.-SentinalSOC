/**
 * correlator.js - In-memory event simulator and rule engine
 */
const crypto = require('crypto');

class Correlator {
    constructor() {
        this.events = [];
        this.alerts = [];
    }

    pushEvent(event) {
        const ev = { ...event, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
        this.events.push(ev);
        this.evaluateRules(ev);
        return ev;
    }

    getAlerts() {
        return [...this.alerts].reverse(); // recent first
    }

    evaluateRules(latestEvent) {
        // Simple in-memory heuristic rules
        const recentEvents = this.events.slice(-10); // Look at last 10 events
        
        let phishCount = recentEvents.filter(e => e.type === 'phish_click').length;
        let loginCount = recentEvents.filter(e => e.type === 'suspicious_login').length;
        let anomalyCount = recentEvents.filter(e => e.type === 'behavior_anomaly').length;

        // Rule 1: High Severity if Phishing + Anomaly
        if (latestEvent.type === 'behavior_anomaly' && phishCount > 0) {
            this.alerts.push({
                id: crypto.randomUUID(),
                title: 'Ransomware Behavior Pattern',
                severity: 'critical',
                source: 'Endpoint Agent',
                affectedUser: latestEvent.user || 'Unknown',
                recommendedResponse: 'Isolate Host',
                timestamp: new Date().toISOString()
            });
            // Clear to prevent duplicate firing
            this.events = [];
            return;
        }

        // Rule 2: Medium Severity if Phish + Login
        if (latestEvent.type === 'suspicious_login' && phishCount > 0) {
             this.alerts.push({
                id: crypto.randomUUID(),
                title: 'Anomalous Login Location',
                severity: 'high',
                source: 'Auth Service',
                affectedUser: latestEvent.user || 'Unknown',
                recommendedResponse: 'Require MFA',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // Single Event rules
        if (latestEvent.type === 'phish_click') {
             this.alerts.push({
                id: crypto.randomUUID(),
                title: 'Phishing Attempt',
                severity: 'medium',
                source: 'Email Gateway',
                affectedUser: latestEvent.user || 'Unknown',
                recommendedResponse: 'Block Sender IP',
                timestamp: new Date().toISOString()
            });
        }
    }

    simulateAttackChain() {
        const user = `user-${Math.floor(Math.random() * 100)}`;
        
        // Step 1
        this.pushEvent({ type: 'phish_click', user, description: 'User clicked malicious link in email' });
        
        // Step 2
        this.pushEvent({ type: 'suspicious_login', user, description: 'Login from new country (RU)' });
        
        // Step 3
        const finalAlert = this.pushEvent({ type: 'behavior_anomaly', user, description: 'Rapid file encryption measured' });
        
        return {
            message: 'Simulated 3-stage attack chain',
            latestAlert: this.alerts[this.alerts.length - 1]
        };
    }
}

// Export a singleton instance
module.exports = new Correlator();
