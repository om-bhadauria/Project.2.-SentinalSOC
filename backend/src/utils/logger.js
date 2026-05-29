const winston = require('winston');
const path = require('path');
const config = require('../config');
const asyncContext = require('./asyncContext');

// Extract correlation ID format
const correlationFormat = winston.format((info) => {
  const store = asyncContext.getStore();
  if (store && store.has('correlationId')) {
    info.correlation_id = store.get('correlationId');
  }
  info.service_name = 'SentinelSOC';
  // severity already loosely matches info.level inherently
  return info;
});

// Define log formats
const logFormat = winston.format.combine(
  correlationFormat(),
  winston.format.timestamp(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  correlationFormat(),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, correlation_id, ...metadata }) => {
    let msg = `${timestamp} [${level}]${correlation_id ? ` <${correlation_id.split('-')[0]}>` : ''}: ${message}`;
    const cleanedMeta = {...metadata};
    delete cleanedMeta.service_name; // reduce console noise
    if (Object.keys(cleanedMeta).length > 0) {
      msg += ` ${JSON.stringify(cleanedMeta)}`;
    }
    return msg;
  })
);

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log')
    })
  ]
});

module.exports = logger;
