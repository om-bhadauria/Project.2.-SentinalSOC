const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');
const Incident = require('../models/Incident');

exports.connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
        logger.info('MongoDB Connected.');

        // Seed Initial Data to Dashboard
        const count = await Incident.countDocuments();
        if (count === 0) {
            logger.info('Database empty. Seeding demo events for SentinelSOC Dashboard...');
            await Incident.create([
                {
                    id: `INC-${Date.now() - 3600000}`,
                    timestamp: Date.now() - 3600000,
                    status: 'OPEN',
                    user: 'demo_admin',
                    severity: 'HIGH',
                    score: '0.90',
                    triggers: [{ rule: 'phishing_to_local_execution', weight: 0.9, matched_events: [] }],
                    recommended_actions: ['quarantine_device', 'block_login'],
                    involved_events: []
                },
                {
                    id: `INC-${Date.now() - 7200000}`,
                    timestamp: Date.now() - 7200000,
                    status: 'CLOSED',
                    user: 'jdoedev',
                    severity: 'MEDIUM',
                    score: '0.65',
                    triggers: [{ rule: 'anomalous_behavior_score', weight: 0.65, matched_events: [] }],
                    recommended_actions: ['warn_user'],
                    involved_events: []
                }
            ]);
            logger.info('MongoDB seeded successfully.');
        }
    } catch (e) {
        logger.warn('Mongoose initial connection failed - Engine gracefully falling back to in-memory mode.', e.message);
    }
};
