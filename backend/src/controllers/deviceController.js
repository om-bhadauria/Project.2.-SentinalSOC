const deviceService = require('../services/deviceService');
const logger = require('../utils/logger');

exports.registerDevice = async (req, res, next) => {
  try {
    const { userId, deviceId, deviceMetadata } = req.body;
    let { ip } = req.body;
    
    if (!ip) ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const riskProfile = await deviceService.registerAndEvaluate(userId, deviceId, deviceMetadata || {}, ip);

    res.json({
      success: true,
      risk_profile: riskProfile
    });
  } catch (error) {
    logger.error('Failed to register device', error);
    next(error);
  }
};
