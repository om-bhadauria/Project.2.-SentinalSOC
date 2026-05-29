const responseService = require('../services/responseService');
const logger = require('../utils/logger');

exports.executeAction = async (req, res, next) => {
  try {
    const { action, payload } = req.body;
    
    // Manual trigger via API
    const result = await responseService.executeAction(action, payload, false);
    
    res.json({
      success: true,
      message: `Action ${action} executed successfully`,
      details: result
    });
  } catch (error) {
    logger.error('Failed to execute incident response action', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getConfig = async (req, res, next) => {
    try {
        res.json(responseService.getConfig());
    } catch (e) {
        next(e);
    }
};

exports.updateConfig = async (req, res, next) => {
    try {
        const result = responseService.updateConfig(req.body);
        res.json({ success: true, config: result });
    } catch (e) {
        next(e);
    }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = responseService.getAuditLogs();
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
