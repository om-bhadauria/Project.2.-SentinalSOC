const winston = require('winston');
const path = require('path');

// Audit specific logger that strictly formats to JSON with Correlation IDs
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'audit-service' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/audit.json'), 
      level: 'info' 
    })
  ]
});

// Helper to inject Correlation IDs
const logAudit = (action, status, userId, details = {}, reqId = null) => {
    const correlationId = reqId || `corr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    auditLogger.info({
        action,
        status,
        userId: userId || 'system',
        correlationId,
        details
    });

    return correlationId;
};

module.exports = { auditLogger, logAudit };
