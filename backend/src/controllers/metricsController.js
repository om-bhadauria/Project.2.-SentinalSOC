const metricsService = require('../services/metricsService');

exports.getMetrics = (req, res) => {
    res.json(metricsService.getMetrics());
};
