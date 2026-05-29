const responseService = require('../src/services/responseService');
const correlator = require('../src/services/rulesEngine');

describe('Response Service & Auto-Mitigation', () => {

    beforeEach(() => {
        responseService.blockedUsers.clear();
        responseService.quarantinedDevices.clear();
        responseService.revokedTokens.clear();
        responseService.auditLog = [];
        responseService.autoEnabled = true;
        responseService.dryRun = false;
    });

    it('should manually block a user permanently', async () => {
        await responseService.executeAction('block_login', { userId: 'mallory' }, false);
        
        expect(responseService.isUserBlocked('mallory')).toBe(true);
        expect(responseService.auditLog.length).toBe(1);
        expect(responseService.auditLog[0].isAuto).toBe(false);
        expect(responseService.auditLog[0].expiresAt).toBe(Infinity);
    });

    it('should dynamically auto-mitigate a HIGH severity incident with TTL', async () => {
        const incident = {
            id: 'INC-1234',
            severity: 'HIGH',
            user: 'eve'
        };
        
        await responseService.autoMitigate(incident);
        
        expect(responseService.isUserBlocked('eve')).toBe(true);
        
        const logs = responseService.getAuditLogs();
        // Should have block_login, revoke_tokens, send_admin_notification
        expect(logs.length).toBe(3);
        
        const blockLog = logs.find(l => l.action === 'block_login');
        expect(blockLog.isAuto).toBe(true);
        expect(blockLog.expiresAt).toBeLessThan(Infinity);
    });

    it('should lift block natively based on TTL expiration', () => {
        // Fake current time
        jest.spyOn(Date, 'now').mockImplementation(() => 1000);
        
        responseService.blockedUsers.set('temp_hacker', { 
            expiresAt: 5000, 
            reason: 'testing', 
            isAuto: true 
        });
        
        expect(responseService.isUserBlocked('temp_hacker')).toBe(true);
        
        // Fast forward past expiration
        jest.spyOn(Date, 'now').mockImplementation(() => 6000);
        
        expect(responseService.isUserBlocked('temp_hacker')).toBe(false);
        
        jest.restoreAllMocks();
    });

    it('should allow admin to manually lift a quarantine', async () => {
        await responseService.executeAction('quarantine_device', { deviceId: 'dev-123' }, true);
        expect(responseService.isDeviceQuarantined('dev-123')).toBe(true);

        responseService.liftQuarantine('dev-123');
        expect(responseService.isDeviceQuarantined('dev-123')).toBe(false);
        
        const log = responseService.getAuditLogs().find(l => l.action === 'lift_device_quarantine');
        expect(log).toBeDefined();
    });

});
