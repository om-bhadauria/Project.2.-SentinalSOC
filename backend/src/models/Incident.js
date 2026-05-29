const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    id: String,
    timestamp: Number,
    status: String,
    user: String,
    severity: String,
    score: String,
    triggers: Array,
    recommended_actions: Array,
    involved_events: Array
});

module.exports = mongoose.model('Incident', incidentSchema);
