// filepath: d:\\Projects\\OdooXNMIT\\tests\\negativeAuthz.test.js
import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb, auth } from './testUtils.js';

function expectStatus(res, code){ expect(res.status, res.body?.error).toBe(code); }

describe('Negative & Authorization Cases', () => {
  beforeAll(async () => { await initTestDb(); }, 60000);

  it('rejects missing auth header on protected route', async () => {
    const res = await api.get('/products');
    expectStatus(res,401);
  });

  it('forbidden when role not allowed (attempt create product as operator) - simulate by crafting token', async () => {
    // Create operator user via signup (role=operator)
    const sign = await api.post('/auth/signup').send({ name:'Op User', email:'op@example.com', password:'opPass1234', role:'operator' });
    expect(sign.status).toBe(201);
    const token = sign.body.token;
    const forbidden = await api.post('/products').set('Authorization', `Bearer ${token}`).send({ sku:'x1', name:'X1', type:'raw', uom:'pcs' });
    expect(forbidden.status).toBe(403);
  });

  it('validation error on create product with invalid type', async () => {
    const res = await auth(api.post('/products').send({ sku:'bad1', name:'Bad', type:'unknown', uom:'pcs' }));
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('not found for missing product id', async () => {
    const res = await auth(api.get('/products/999999'));
    expect(res.status).toBe(404);
  });

  it('cannot delete non-draft MO (attempt delete existing seeded terminal MO)', async () => {
    // seeded MO with id 5 previously terminal (done/not_assigned), delete should 404/400
    const res = await auth(api.delete('/mos/5'));
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('work order start returns 404 for missing id', async () => {
    const res = await auth(api.post('/wos/999999/start'));
    expect(res.status).toBe(404);
  });
});
