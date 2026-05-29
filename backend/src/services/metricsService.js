class MetricsService {
    constructor() {
        this.metrics = {
            events_received: 0,
            incidents_emitted: 0,
            actions_executed: 0
        };
    }

    incrementEvent() {
        this.metrics.events_received++;
    }

    incrementIncident() {
        this.metrics.incidents_emitted++;
    }

    incrementAction() {
        this.metrics.actions_executed++;
    }

    getMetrics() {
        return this.metrics;
    }
}

module.exports = new MetricsService();
