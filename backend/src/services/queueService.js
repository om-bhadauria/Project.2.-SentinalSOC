const { createClient } = require('redis');
const EventEmitter = require('events');
const config = require('../config');
const logger = require('../utils/logger');
const rulesEngine = require('./rulesEngine');

class QueueService extends EventEmitter {
  constructor() {
    super();
    this.useRedis = config.useRedis;
    this.redisClient = null;
  }

  async init() {
    if (this.useRedis) {
      try {
        this.redisClient = createClient({ url: config.redisUrl });
        this.redisClient.on('error', (err) => logger.error('Redis Client Error', err));
        await this.redisClient.connect();
        logger.info('Connected to Redis');
        
        // Simple polling for a queue if using redis
        this.startRedisProcessor();
      } catch (error) {
        logger.error('Failed to connect to Redis. Falling back to in-memory queue.', error);
        this.useRedis = false;
      }
    }

    if (!this.useRedis) {
      // In-memory processor
      this.on('event', this.processEvent.bind(this));
    }
  }

  async publish(eventType, payload) {
    const event = { type: eventType, payload, timestamp: Date.now() };
    if (this.useRedis && this.redisClient) {
      await this.redisClient.lPush('sentinelsoc:events', JSON.stringify(event));
    } else {
      // In memory emit
      this.emit('event', event);
    }
  }

  async processEvent(event) {
    logger.debug(`Processing event: ${event.type}`);
    try {
      // Pass event to rules engine for correlation
      await rulesEngine.evaluate(event);
    } catch (error) {
      logger.error('Error processing event', error);
    }
  }

  startRedisProcessor() {
    // Simple worker loop to process from redis LIST
    const processLoop = async () => {
      try {
        if (this.redisClient) {
          const item = await this.redisClient.brPop('sentinelsoc:events', 0);
          if (item) {
            const event = JSON.parse(item.element);
            await this.processEvent(event);
          }
        }
      } catch (error) {
        logger.error('Redis processor error:', error);
      }
      setTimeout(processLoop, 100);
    };
    processLoop();
  }
}

module.exports = new QueueService();
