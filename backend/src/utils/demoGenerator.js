const config = require('../config');
const logger = require('./logger');

let interval = null;

const USERS = ['demo_target', 'admin_jane', 'sales_bob', 'dev_charlie', 'finance_diana'];
const EVENT_TYPES = [
    'phish_click', 'new_device', 'failed_login', 'successful_login', 
    'behavior_anomaly', 'malicious_url_scanned', 'sensitive_file_access', 'large_download'
];

exports.start = () => {
    if (!config.demoMode) {
        logger.info("Demo Mode disabled, skipping automatic background noise generation.");
        return;
    }

    const queueService = require('../services/queueService');
    logger.info("Demo Mode ENABLED. Automatically generating simulated threat telemetry in the background...");
    
    // Every 8 seconds, generate a random background event to act as environmental noise
    // The Threat Correlator will aggregate these and automatically produce sample alerts
    interval = setInterval(() => {
        const user = USERS[Math.floor(Math.random() * USERS.length)];
        const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
        
        queueService.publish('USER_ACTIVITY', {
            userId: user,
            eventType: eventType,
            metadata: { 
                source: 'demo_auto_gen', 
                ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
                device_id: `fp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
            },
            timestamp: Date.now()
        }).catch(e => logger.error("Demo generator queue error", e));
    }, 8000);
};

exports.stop = () => {
    if (interval) clearInterval(interval);
};
