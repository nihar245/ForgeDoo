import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb } from './testUtils.js';

describe('Auth & Users', () => {
  beforeAll(async () => {
    await initTestDb();
  }, 60000);

  it('logs in seeded admin', async () => {
    const res = await api.post('/auth/login').send({ email: 'niharmehta@gmail.com', password: '123' });
    expect(res.status).toBe(200);
    expect(res.body).toBeTruthy();
  });

  it('rejects wrong password', async () => {
    const res = await api.post('/auth/login').send({ email: 'niharmehta@gmail.com', password: 'wrong' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
