import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb, auth } from './testUtils.js';

let moId;

function expectStatus(res, code){ expect(res.status, res.body?.error).toBe(code); }

describe('Manufacturing Orders Lifecycle', () => {
  beforeAll(async () => { await initTestDb(); }, 60000);

  it('creates draft MO', async () => {
    const res = await auth(api.post('/mos').send({ product_id: 1, quantity: 25, start_date: '2025-09-20', end_date: '2025-09-25' }));
    expectStatus(res,201);
    moId = res.body.data.id;
    expect(res.body.data.status).toBe('draft');
  });

  it('confirms MO', async () => {
    const res = await auth(api.post(`/mos/${moId}/confirm`));
    expectStatus(res,200);
    expect(res.body.data.status).toBe('confirmed');
  });

  it('starts MO', async () => {
    const res = await auth(api.post(`/mos/${moId}/start`));
    expectStatus(res,200);
    expect(res.body.data.status).toBe('in_progress');
  });

  it('completes MO directly from in_progress', async () => {
    const res = await auth(api.post(`/mos/${moId}/complete`));
    expectStatus(res,200);
    expect(res.body.data.status).toBe('done');
  });

  it('fetches cost report', async () => {
    const res = await auth(api.get(`/mos/${moId}/cost`));
    expectStatus(res,200);
    expect(res.body.data.total_cost).toBeDefined();
  });

  it('lists MOs filtered by status=done', async () => {
    const res = await auth(api.get('/mos').query({ status: 'done' }));
    expectStatus(res,200);
    expect(res.body.data.some(m=>m.id === moId)).toBe(true);
  });
});
