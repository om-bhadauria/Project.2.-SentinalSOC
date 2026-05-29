const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const apiRoutes = require('./routes/api');
const { errorHandler } = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const asyncContext = require('./utils/asyncContext');

const app = express();

// Trace / Correlation ID Middleware
app.use((req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
    res.setHeader('X-Correlation-ID', correlationId);
    asyncContext.run(new Map([['correlationId', correlationId]]), () => {
        next();
    });
});

// Security middlewares
app.use(helmet());

// CORS configuration (whitelist localhost or specified origin)
const allowedOrigins = config.corsOrigin.split(',');
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Parsing and logging
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/metrics', (req, res) => {
    // Basic service metrics placeholder, compatible with Prometheus scrapers
    const memUsage = process.memoryUsage();
    res.send(`
# HELP sentinelsoc_api_uptime_seconds The total uptime of the API service
# TYPE sentinelsoc_api_uptime_seconds counter
sentinelsoc_api_uptime_seconds ${process.uptime()}

# HELP sentinelsoc_api_memory_heap_used_bytes Heap memory used by API
# TYPE sentinelsoc_api_memory_heap_used_bytes gauge
sentinelsoc_api_memory_heap_used_bytes ${memUsage.heapUsed}
    `.trim());
});
app.use('/healthz', require('./routes/health'));

// API Routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
