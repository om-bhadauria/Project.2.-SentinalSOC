const { check, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const scanUrlValidator = [
  check('url').isURL().withMessage('A valid URL is required'),
  handleValidationErrors
];

const loginValidator = [
  check('email').optional().isEmail().withMessage('A valid email is required'),
  check('userId').optional().notEmpty().withMessage('userId cannot be empty'),
  check('password').notEmpty().withMessage('password is required'),
  handleValidationErrors
];

const registerValidator = [
  check('name').trim().isLength({ min: 2 }).withMessage('name must be at least 2 characters'),
  check('email').isEmail().withMessage('A valid email is required'),
  check('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  handleValidationErrors
];

const activityValidator = [
  check('userId').notEmpty().withMessage('userId is required'),
  check('eventType').notEmpty().withMessage('eventType is required'),
  check('metadata').optional().isObject().withMessage('metadata must be an object'),
  handleValidationErrors
];

const deviceRegistrationValidator = [
  check('userId').notEmpty().withMessage('userId is required'),
  check('deviceId').notEmpty().withMessage('deviceId is required'),
  check('deviceMetadata').optional().isObject().withMessage('metadata must be an object'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  scanUrlValidator,
  loginValidator,
  registerValidator,
  activityValidator,
  deviceRegistrationValidator
};
