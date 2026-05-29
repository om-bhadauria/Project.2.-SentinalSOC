const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
  if (config.demoMode) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Unauthorized access attempt: No token provided');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn(`Unauthorized access attempt: Invalid token - ${error.message}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (config.demoMode) return next();

  if (!req.user || req.user.role !== 'admin') {
    logger.error(`Forbidden RBAC Access Attempt: User ID ${req.user?.userId || 'unknown'} attempted to access admin routes.`);
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
