const express = require('express');
const { apiLimiter, scanLimiter } = require('../middlewares/rateLimiter');
const { scanUrlValidator, loginValidator, registerValidator, activityValidator, deviceRegistrationValidator } = require('../middlewares/validators');
const authController = require('../controllers/authController');
const scanController = require('../controllers/scanController');
const activityController = require('../controllers/activityController');
const alertController = require('../controllers/alertController');
const deviceController = require('../controllers/deviceController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(apiLimiter);

// Public routes
router.post('/login', loginValidator, (req, res, next) => authController.login(req, res, next));
router.post('/register', registerValidator, (req, res, next) => authController.register(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));
router.post('/device/register', authenticate, deviceRegistrationValidator, (req, res, next) => deviceController.registerDevice(req, res, next));

// Protected endpoints
router.post('/scan/url', authenticate, scanUrlValidator, scanController.scanUrl);
router.get('/scan-result/:id', authenticate, scanController.getScanResult);
router.post('/activity', authenticate, activityValidator, activityController.logActivity);
router.post('/simulate-attack', authenticate, activityController.simulateAttack);
router.get('/alerts', alertController.getAlerts);
router.post('/alerts', authenticate, requireAdmin, alertController.createAlert);
router.get('/users/:id/risks', activityController.getUserRisks);

// Observability
const metricsController = require('../controllers/metricsController');
router.get('/metrics', (req, res) => metricsController.getMetrics(req, res));

// Incident Response
const responseController = require('../controllers/responseController');
router.post('/response/execute', [
   require('express-validator').check('action').notEmpty(),
   require('express-validator').check('payload').isObject()
], require('../middlewares/validators').handleValidationErrors, authenticate, requireAdmin, (req, res, next) => responseController.executeAction(req, res, next));
router.get('/response/audit', authenticate, requireAdmin, (req, res, next) => responseController.getAuditLogs(req, res, next));
router.get('/response/config', authenticate, requireAdmin, (req, res, next) => responseController.getConfig(req, res, next));
router.post('/response/config', authenticate, requireAdmin, (req, res, next) => responseController.updateConfig(req, res, next));

// Healthcheck endpoint
router.get('/healthz', (req, res) => res.json({ status: 'ok' }));

module.exports = router;
