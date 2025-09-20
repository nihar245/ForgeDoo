import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb, auth } from './testUtils.js';

let createdId;

describe('Products CRUD', () => {
  beforeAll(async () => { await initTestDb(); }, 60000);

  it('lists seeded products', async () => {
    const res = await auth(api.get('/products'));
    expect(res.status).toBe(200);
    expect(res.body.items?.length).toBeGreaterThan(0);
  });

  it('creates a product', async () => {
    const payload = { sku: 'tst001', name: 'Test Product', type: 'raw', uom: 'pcs' };
    const res = await auth(api.post('/products').send(payload));
    expect(res.status).toBe(201);
    createdId = res.body.item.id;
  });

  it('gets the created product', async () => {
    const res = await auth(api.get(`/products/${createdId}`));
    expect(res.status).toBe(200);
    expect(res.body.item.id).toBe(createdId);
  });

  it('updates the product', async () => {
    const res = await auth(api.put(`/products/${createdId}`).send({ sku: 'tst001', name: 'Updated Product', type: 'raw', uom: 'pcs' }));
    expect(res.status).toBe(200);
    expect(res.body.item.name).toMatch(/Updated/);
  });

  it('deletes the product', async () => {
    const res = await auth(api.delete(`/products/${createdId}`));
    expect(res.status).toBe(204);
    const missing = await auth(api.get(`/products/${createdId}`));
    expect(missing.status).toBeGreaterThanOrEqual(400);
  });
});
