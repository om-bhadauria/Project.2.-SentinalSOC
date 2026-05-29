require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-default-key-change-in-prod',
  vtApiKey: process.env.VT_API_KEY || '',
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
  useRedis: process.env.USE_REDIS === 'true',
  mongoUri: process.env.MONGO_URI || 'mongodb://mongodb:27017/sentinelsoc',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  demoMode: process.env.DEMO_MODE === 'true'
};
