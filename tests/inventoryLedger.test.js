// filepath: d:\\Projects\\OdooXNMIT\\tests\\inventoryLedger.test.js
import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb, auth } from './testUtils.js';
import pg from 'pg';

let productIdForAdjust = 5; // seeded raw material (Paper Sheets A4)
let createdLedgerId;

function expectStatus(res, code){ expect(res.status, res.body?.error).toBe(code); }

async function fetchLedgerEntry(id){
  const res = await auth(api.get(`/ledger/${id}`));
  return res;
}

describe('Inventory & Ledger', () => {
  beforeAll(async () => { await initTestDb(); }, 60000);

  it('lists inventory (seeded)', async () => {
    const res = await auth(api.get('/inventory'));
    expectStatus(res,200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('gets inventory for existing product', async () => {
    const res = await auth(api.get(`/inventory/product/${productIdForAdjust}`));
    expectStatus(res,200);
    expect(res.body.item.product_id).toBe(productIdForAdjust);
    expect(res.body.item.quantity_available).toBeDefined();
  });

  it('returns default zero inventory for product without record (new product)', async () => {
    // create a product (raw maps to raw_material) then fetch inventory
    const createP = await auth(api.post('/products').send({ sku:'invtest1', name:'Temp Raw', type:'raw', uom:'pcs' }));
    expectStatus(createP,201); const newProdId = createP.body.item.id;
    const inv = await auth(api.get(`/inventory/product/${newProdId}`));
    expectStatus(inv,200);
    expect(inv.body.item.product_id).toBe(newProdId);
    expect(Number(inv.body.item.quantity_available||0)).toBe(0);
  });

  it('adjusts inventory IN', async () => {
    const before = await auth(api.get(`/inventory/product/${productIdForAdjust}`));
    const beforeQty = Number(before.body.item.quantity_available||0);
    const adj = await auth(api.post(`/inventory/product/${productIdForAdjust}/adjust`).send({ qty: 250, type: 'IN', note: 'Test Inbound' }));
    expectStatus(adj,200);
    const after = await auth(api.get(`/inventory/product/${productIdForAdjust}`));
    const afterQty = Number(after.body.item.quantity_available||0);
    expect(afterQty - beforeQty).toBe(250);
  });

  it('adjusts inventory OUT', async () => {
    const before = await auth(api.get(`/inventory/product/${productIdForAdjust}`));
    const beforeQty = Number(before.body.item.quantity_available||0);
    const adj = await auth(api.post(`/inventory/product/${productIdForAdjust}/adjust`).send({ qty: 50, type: 'OUT', note: 'Test Outbound' }));
    expectStatus(adj,200);
    const after = await auth(api.get(`/inventory/product/${productIdForAdjust}`));
    const afterQty = Number(after.body.item.quantity_available||0);
    expect(beforeQty - afterQty).toBe(50);
  });

  it('adjusts inventory ADJUST (direct delta)', async () => {
    const before = await auth(api.get(`/inventory/product/${productIdForAdjust}`));
    const beforeQty = Number(before.body.item.quantity_available||0);
    const adj = await auth(api.post(`/inventory/product/${productIdForAdjust}/adjust`).send({ qty: 10, type: 'ADJUST', note: 'Recount' }));
    expectStatus(adj,200);
    const after = await auth(api.get(`/inventory/product/${productIdForAdjust}`));
    const afterQty = Number(after.body.item.quantity_available||0);
    // ADJUST path currently treats as +qty (business rule placeholder)
    expect(afterQty - beforeQty).toBe(10);
  });

  it('lists ledger with filters & captures one entry', async () => {
    const res = await auth(api.get('/ledger').query({ limit: 5, movement_type: 'in' }));
    expectStatus(res,200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    createdLedgerId = res.body.data[0].id;
  });

  it('gets single ledger entry', async () => {
    const res = await fetchLedgerEntry(createdLedgerId);
    expectStatus(res,200);
    expect(res.body.data.id).toBe(createdLedgerId);
  });

  it('ledger entry 404 for non-existent id', async () => {
    const res = await auth(api.get('/ledger/999999'));
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
