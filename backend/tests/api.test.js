const request = require('supertest');
const db = require('../src/db');

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
  })),
  Worker: jest.fn(),
}));

jest.mock('../src/db', () => ({
  query: jest.fn(),
}));

const app = require('../src/app');

async function loginAsAdmin() {
  const response = await request(app).post('/api/login').send({
    email: 'admin@sentinel.soc',
    password: 'SentinelDemo123!',
  });

  return response.body.token;
}

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/login', () => {
    it('should validate missing payloads', async () => {
      const response = await request(app).post('/api/login').send({});
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should issue a token for the demo admin', async () => {
      const response = await request(app).post('/api/login').send({
        email: 'admin@sentinel.soc',
        password: 'SentinelDemo123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('admin@sentinel.soc');
    });
  });

  describe('POST /api/scan/url', () => {
    it('should reject unauthenticated scan requests', async () => {
      const response = await request(app).post('/api/scan/url').send({
        url: 'https://example.com',
      });

      expect(response.status).toBe(401);
    });

    it('should validate invalid URLs', async () => {
      const token = await loginAsAdmin();
      const response = await request(app)
        .post('/api/scan/url')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: 'not-a-valid-url' });

      expect(response.status).toBe(400);
    });

    it('should enqueue a valid scan and return a pending job', async () => {
      const token = await loginAsAdmin();
      db.query.mockResolvedValueOnce({});

      const response = await request(app)
        .post('/api/scan/url')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(202);
      expect(response.body.success).toBe(true);
      expect(response.body.data.job_id).toBeDefined();
      expect(response.body.data.status).toBe('pending');
    });
  });
});
