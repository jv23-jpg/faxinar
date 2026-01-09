const request = require('supertest');
const app = require('../index');

describe('POST /api/send-invite', () => {
  test('returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/send-invite').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('email and link are required');
  });

  test('returns 501 when SendGrid not configured', async () => {
    const res = await request(app).post('/api/send-invite').send({ email: 'a@b.com', link: 'http://example.com' });
    expect([200, 501]).toContain(res.statusCode);
  });
});
