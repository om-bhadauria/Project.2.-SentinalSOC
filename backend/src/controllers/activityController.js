/**
 * activityController.js - Activity logging and Attack simulation
 */
const correlator = require('../lib/correlator');

exports.simulateAttack = (req, res, next) => {
    try {
        const result = correlator.simulateAttackChain();
        res.status(200).json({
            success: true,
            message: 'Attack chain simulated successfully.',
            data: result
        });
    } catch (err) {
        next(err);
    }
};

exports.logActivity = (req, res, next) => {
    try {
        const event = correlator.pushEvent(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (err) {
        next(err);
    }
};

exports.getUserRisks = (req, res, next) => {
    res.status(200).json({
        success: true,
        data: { userId: req.params.id, riskScore: 45, reason: 'N/A' }
    });
};
