import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb, auth } from './testUtils.js';

let createdId;

describe('BOM CRUD + Upsert', () => {
  beforeAll(async () => { await initTestDb(); }, 60000);

  it('lists seeded BOMs', async () => {
    const res = await auth(api.get('/boms'));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('creates a BOM with components & operations', async () => {
    const payload = {
      product_id: 1,
      name: 'Custom BOM X',
      components: [ { component_product_id: 5, qty_per_unit: 10, uom: 'pcs' } ],
      operations: [ { operation_name: 'Cutting', work_center_id: 1, duration_mins: 15 } ]
    };
    const res = await auth(api.post('/boms').send(payload));
    expect(res.status).toBe(201);
    createdId = res.body.item.id;
    expect(res.body.item.components.length).toBe(1);
    expect(res.body.item.operations.length).toBe(1);
  });

  it('gets created BOM', async () => {
    const res = await auth(api.get(`/boms/${createdId}`));
    expect(res.status).toBe(200);
    expect(res.body.item.id).toBe(createdId);
  });

  it('updates BOM replacing components/operations', async () => {
    const res = await auth(api.patch(`/boms/${createdId}`).send({ components: [ { component_product_id: 6, qty_per_unit: 2, uom: 'pcs' } ], operations: [ { operation_name: 'Binding', work_center_id: 2, duration_mins: 20 } ] }));
    expect(res.status).toBe(200);
    expect(res.body.item.components[0].component_product_id).toBe(6);
  });

  it('deletes BOM', async () => {
    const res = await auth(api.delete(`/boms/${createdId}`));
    expect(res.status).toBe(200);
    const missing = await auth(api.get(`/boms/${createdId}`));
    expect(missing.status).toBeGreaterThanOrEqual(400);
  });

  it('upserts a BOM by reference (create)', async () => {
    const payload = {
      product_id: 1,
      reference: 'refA',
      output_quantity: 5,
      components: [ { component_product_id: 5, qty_per_unit: 2, uom: 'pcs' } ],
      operations: [ { operation_name: 'Assemble', work_center_id: 1, duration_mins: 12 } ]
    };
    const res = await auth(api.post('/boms/upsert').send(payload));
    expect(res.status).toBe(201);
    expect(res.body.item.output_quantity).toBe(5);
  });

  it('upserts same BOM updates existing', async () => {
    const payload = {
      product_id: 1,
      reference: 'refA',
      output_quantity: 10,
      components: [ { component_product_id: 6, qty_per_unit: 1, uom: 'pcs' } ],
      operations: [ { operation_name: 'Assemble', work_center_id: 1, duration_mins: 30 } ]
    };
    const res = await auth(api.post('/boms/upsert').send(payload));
    expect(res.status).toBe(201);
    expect(res.body.item.output_quantity).toBe(10);
    expect(res.body.item.components[0].component_product_id).toBe(6);
  });

  it('lists BOM references simplified', async () => {
    const res = await auth(api.get('/boms/refs/all'));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    const found = res.body.items.find(b => b.reference === 'refA');
    expect(found).toBeTruthy();
    expect(found.output_quantity).toBe(10);
  });
});
