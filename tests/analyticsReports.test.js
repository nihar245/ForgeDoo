// filepath: d:\\Projects\\OdooXNMIT\\tests\\analyticsReports.test.js
import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb, auth } from './testUtils.js';

const RANGE = { start: '2025-09-01', end: '2025-09-30' };

function expectStatus(res, code){ expect(res.status, res.body?.error).toBe(code); }

describe('Analytics & Reports', () => {
  beforeAll(async () => { await initTestDb(); }, 60000);

  it('dashboard returns MO + WO KPIs', async () => {
    const res = await auth(api.get('/analytics/dashboard'));
    expectStatus(res,200);
  const keys = ['draft','confirmed','in_progress','done','cancelled','wo_pending','wo_in_progress','wo_paused','wo_done'];
    keys.forEach(k=>expect(res.body.data).toHaveProperty(k));
  });

  it('analytics throughput returns done counts per period', async () => {
    const res = await auth(api.get('/analytics/throughput').query(RANGE));
    expectStatus(res,200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('analytics cycle-time returns average cycle per product', async () => {
    const res = await auth(api.get('/analytics/cycle-time').query(RANGE));
    expectStatus(res,200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if(res.body.data.length){
      const row = res.body.data[0];
      expect(row).toHaveProperty('product_id');
      expect(row).toHaveProperty('avg_cycle_days');
    }
  });

  it('reports throughput matches analytics style (date, orders_completed)', async () => {
    const res = await auth(api.get('/reports/throughput').query(RANGE));
    expectStatus(res,200);
    if(res.body.data.length){
      const row = res.body.data[0];
      expect(row).toHaveProperty('date');
      expect(row).toHaveProperty('orders_completed');
    }
  });

  it('reports user-work returns user aggregates', async () => {
    const res = await auth(api.get('/reports/user-work'));
    expectStatus(res,200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if(res.body.data.length){
      const row = res.body.data[0];
      expect(row).toHaveProperty('user_id');
      expect(row).toHaveProperty('work_orders_done');
    }
  });

  it('reports inventory returns product inventory snapshot', async () => {
    const res = await auth(api.get('/reports/inventory'));
    expectStatus(res,200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if(res.body.data.length){
      const row = res.body.data[0];
      expect(row).toHaveProperty('product_id');
      expect(row).toHaveProperty('quantity_available');
    }
  });
});
