/**
 * alertController.js - Serves generated alerts
 */
const db = require('../db');
const crypto = require('crypto');
const logger = require('../utils/logger');
const memoryAlerts = [];

exports.getAlerts = async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 100');
        res.status(200).json({
            success: true,
            count: result.rowCount,
            data: result.rows
        });
    } catch (err) {
        logger.warn('Alert database unavailable; serving in-memory alerts.', err.message);
        res.status(200).json({
            success: true,
            count: memoryAlerts.length,
            data: memoryAlerts.slice(0, 100)
        });
    }
};

exports.createAlert = async (req, res, next) => {
    try {
        const { type, severity, title, description, source_ip, target_user, system } = req.body;
        
        if (!type || !severity || !title) {
            return res.status(400).json({ success: false, error: 'type, severity, and title are required' });
        }

        const alertId = crypto.randomUUID();
        
        let alert;
        try {
            const result = await db.query(`
                INSERT INTO alerts (id, type, severity, title, description, source_ip, target_user, system)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [alertId, type, severity, title, description, source_ip, target_user, system]);
            alert = result.rows[0];
        } catch (dbError) {
            logger.warn('Alert database unavailable; storing alert in memory.', dbError.message);
            alert = {
                id: alertId,
                type,
                severity,
                title,
                description,
                source_ip,
                target_user,
                system,
                status: 'active',
                created_at: new Date().toISOString()
            };
            memoryAlerts.unshift(alert);
        }

        logger.info(`Manual alert created manually: ${alertId}`);

        res.status(201).json({
            success: true,
            data: alert
        });
    } catch (err) {
        next(err);
    }
};
