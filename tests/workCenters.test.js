import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb, auth } from './testUtils.js';

let wcId;

describe('Work Centers', () => {
  beforeAll(async () => { await initTestDb(); }, 60000);

  it('lists seeded work centers', async () => {
    const res = await auth(api.get('/work-centers'));
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('creates a work center', async () => {
    const res = await auth(api.post('/work-centers').send({ name: 'Test WC', hourly_cost: 123.45, capacity: 50, location: 'X' }));
    expect(res.status).toBe(201);
    wcId = res.body.item.id;
  });

  it('gets created work center', async () => {
    const res = await auth(api.get(`/work-centers/${wcId}`));
    expect(res.status).toBe(200);
    expect(res.body.item.id).toBe(wcId);
  });

  it('updates work center', async () => {
    const res = await auth(api.patch(`/work-centers/${wcId}`)).send({ name: 'Updated WC', hourly_cost: 150, capacity: 60, location: 'Y' });
    expect(res.status).toBe(200);
    expect(res.body.item.name).toMatch(/Updated/);
  });

  it('utilization endpoint returns data', async () => {
    // Use a broad date range covering seeded WOs
    const res = await auth(api.get('/work-centers/_utilization').query({ start: '2025-09-01', end: '2025-09-30' }));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('deletes work center', async () => {
    const res = await auth(api.delete(`/work-centers/${wcId}`));
    expect(res.status).toBe(200);
    const missing = await auth(api.get(`/work-centers/${wcId}`));
    expect(missing.status).toBeGreaterThanOrEqual(400);
  });
});
