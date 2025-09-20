import { describe, it, expect, beforeAll } from 'vitest';
import { api, initTestDb, auth } from './testUtils.js';

beforeAll(async () => {
  await initTestDb();
});

describe('Self endpoints', () => {
  it('GET /me/profile returns profile with stats', async () => {
    const res = await auth(api.get('/me/profile'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('stats');
    expect(res.body.stats).toHaveProperty('mos_created');
  });

  it('GET /me/reports/work-orders returns array data', async () => {
    const res = await auth(api.get('/me/reports/work-orders'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
