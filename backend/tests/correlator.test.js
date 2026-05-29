const correlator = require('../src/services/rulesEngine');

describe('Correlator Engine', () => {
    
    beforeEach(() => {
        // Reset state before tests
        correlator.incidents = [];
        correlator.eventWindow.clear();
    });

    it('should trigger HIGH severity on high risk device', async () => {
        await correlator.evaluate({
            type: 'HIGH_RISK_DEVICE',
            payload: { userId: 'alice' }
        });

        const alerts = await correlator.getAlerts();
        expect(alerts.length).toBe(1);
        expect(alerts[0].severity).toBe('HIGH');
        expect(alerts[0].triggers.some(t => t.rule === 'rule_high_risk_device')).toBe(true);
        expect(alerts[0].user).toBe('alice');
        expect(alerts[0].recommended_actions).toContain('block_login');
    });

    it('should combine multiple rules into composite incident (LOW/MEDIUM)', async () => {
        // Send a phish click (part of rule_phish_newdevice)
        await correlator.evaluate({
            type: 'USER_ACTIVITY',
            payload: { userId: 'bob', eventType: 'phish_click' }
        });
        
        let alerts = await correlator.getAlerts();
        expect(alerts.length).toBe(0); // Because new_device hasn't happened yet

        // Trigger new_device
        await correlator.evaluate({
            type: 'USER_ACTIVITY',
            payload: { userId: 'bob', eventType: 'new_device' }
        });

        alerts = await correlator.getAlerts();
        expect(alerts.length).toBe(1);
        
        // phish_click + new_device is weight 0.6 -> LOW with current thresholds
        expect(alerts[0].severity).toBe('LOW');
    });

    it('should track logic per user separately', async () => {
        await correlator.evaluate({
            type: 'USER_ACTIVITY',
            payload: { userId: 'charlie', eventType: 'phish_click' }
        });
        
        await correlator.evaluate({
            type: 'USER_ACTIVITY',
            payload: { userId: 'dave', eventType: 'new_device' }
        });
        
        // Neither charlie nor dave completed the required 2 conditions
        const alerts = await correlator.getAlerts();
        expect(alerts.length).toBe(0);
    });

    it('should boost score with optional ML Enrichment if risk_score is high', async () => {
        await correlator.evaluate({
            type: 'USER_ACTIVITY',
            payload: { userId: 'ml_test', eventType: 'phish_click', risk_score: 0.9 }
        });
        
        await correlator.evaluate({
            type: 'USER_ACTIVITY',
            payload: { userId: 'ml_test', eventType: 'new_device' }
        });
        
        const alerts = await correlator.getAlerts();
        expect(alerts.length).toBe(1);
        
        const incident = alerts[0];
        // The ML enrichment alone is enough to produce a low-severity incident.
        expect(Number(incident.score)).toBe(0.27);
        expect(incident.triggers.some(t => t.rule === 'ml_enrichment')).toBe(true);
    });
    
    it('should drop events outside of the sliding window', async () => {
        // Fake the timestamp
        jest.spyOn(Date, 'now').mockImplementation(() => 10000);
        
        await correlator.evaluate({
            type: 'USER_ACTIVITY',
            payload: { userId: 'eve', eventType: 'phish_click' }
        });
        
        // Fast forward 2 hours
        jest.spyOn(Date, 'now').mockImplementation(() => 10000 + (2 * 60 * 60 * 1000));
        
        // Send second part
        await correlator.evaluate({
            type: 'USER_ACTIVITY',
            payload: { userId: 'eve', eventType: 'new_device' }
        });
        
        const alerts = await correlator.getAlerts();
        expect(alerts.length).toBe(0); // The first event should have been pruned out
        
        // Restore standard time
        jest.restoreAllMocks();
    });
});
