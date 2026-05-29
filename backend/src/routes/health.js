const express = require('express');
const router = express.Router();
const queueService = require('../services/queueService');
const rulesEngine = require('../services/rulesEngine');

router.get('/healthz', async (req, res) => {
    // Basic liveness check
    let alertsLength = 0;
    try { alertsLength = (await rulesEngine.getAlerts()).length; } catch(e) {}

    const health = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        redis_connected: queueService.useRedis ? Boolean(queueService.redisClient?.isReady) : 'N/A (Memory)',
        rules_active: alertsLength >= 0
    };
    
    // Attempting a pseudo-readiness fail if redis was requested but is completely dead
    if (queueService.useRedis && !queueService.redisClient?.isReady) {
       return res.status(503).json({...health, status: 'DOWN', error: 'Redis unready'});
    }
    
    res.status(200).json(health);
});

module.exports = router;
