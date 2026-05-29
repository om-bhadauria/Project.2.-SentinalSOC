const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');
const { Queue } = require('bullmq');

// Mock Redis queue to track inserted jobs during test
jest.mock('bullmq', () => {
    return {
        Queue: jest.fn().mockImplementation(() => ({
            add: jest.fn().mockResolvedValue({ id: 'mock-job-id' })
        })),
        Worker: jest.fn()
    };
});

// Mock database to simulate postgres locally without spinning up a real test DB
jest.mock('../src/db', () => ({
    query: jest.fn()
}));

describe('SentinelSOC Integration Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /health', () => {
        it('should return 200 OK with timestamp', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'ok');
            expect(res.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /metrics', () => {
        it('should return 200 with Prometheus metrics format', async () => {
            const res = await request(app).get('/metrics');
            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain('sentinelsoc_api_uptime_seconds');
        });
    });

    describe('POST /api/scan/url', () => {
        it('should reject invalid URL requests', async () => {
            const login = await request(app).post('/api/login').send({
                email: 'admin@sentinel.soc',
                password: 'SentinelDemo123!',
            });

            const res = await request(app)
                .post('/api/scan/url')
                .set('Authorization', `Bearer ${login.body.token}`)
                .send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('should insert into DB, enqueue to Redis, and return 202', async () => {
            const login = await request(app).post('/api/login').send({
                email: 'admin@sentinel.soc',
                password: 'SentinelDemo123!',
            });
            db.query.mockResolvedValueOnce({}); // Mock DB insert

            const res = await request(app)
                .post('/api/scan/url')
                .set('Authorization', `Bearer ${login.body.token}`)
                .send({ url: 'http://malicious-login-xyz.com' });

            expect(res.statusCode).toEqual(202);
            expect(res.body.success).toEqual(true);
            expect(res.body.data).toHaveProperty('job_id');
            expect(res.body.data).toHaveProperty('status', 'pending');
            expect(db.query).toHaveBeenCalledTimes(1);
        });
    });

    describe('POST /api/alerts', () => {
        it('should create an alert and return 201', async () => {
            const login = await request(app).post('/api/login').send({
                email: 'admin@sentinel.soc',
                password: 'SentinelDemo123!',
            });
            const mockAlert = { id: '123', type: 'phishing', severity: 'high', title: 'Test Alert' };
            db.query.mockResolvedValueOnce({ rows: [mockAlert] });

            const res = await request(app)
                .post('/api/alerts')
                .set('Authorization', `Bearer ${login.body.token}`)
                .send({ type: 'phishing', severity: 'high', title: 'Test Alert' });

            expect(res.statusCode).toEqual(201);
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(res.body.data.id).toEqual('123');
        });
    });
});
