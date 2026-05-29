const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const queueService = require('./services/queueService');
const openPhishLoader = require('./services/openPhishLoader');
const path = require('path');

const http = require('http');
const { Server } = require('socket.io');

async function startServer() {
  try {
    // Connect to MongoDB and seed dashboard alerts natively
    const db = require('./services/db');
    await db.connectDB();

    const postgres = require('./db');
    if (process.env.INIT_DB !== 'false') {
      try {
        await postgres.initSchema();
      } catch (error) {
        logger.warn('Postgres schema initialization skipped; API will use graceful fallbacks where possible.', error.message);
      }
    }

    // Optionally load openphish feed if it exists
    await openPhishLoader.loadFromCsv(path.join(__dirname, '../data/openphish.csv'));
    
    // Initialize queue (connect to Redis if enabled)
    await queueService.init();
    logger.info(`Queue service initialized. Using Redis: ${config.useRedis}`);

    // Create standard HTTP server wrapping Express
    const server = http.createServer(app);

    // Attach Socket.IO to server
    const io = new Server(server, {
      cors: {
        origin: config.corsOrigin,
        methods: ["GET", "POST"]
      }
    });

    // Provide io instance to correlator rules engine
    const rulesEngine = require('./services/rulesEngine');
    rulesEngine.setSocketIo(io);

    io.on('connection', (socket) => {
      logger.info(`Dashboard client connected: ${socket.id}`);
      socket.on('disconnect', () => {
        logger.debug(`Dashboard client disconnected: ${socket.id}`);
      });
    });

    // Start background simulation engine if DEMO_MODE=true
    const demoGenerator = require('./utils/demoGenerator');
    demoGenerator.start();

    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} with WebSocket support`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
