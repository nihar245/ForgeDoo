// filepath: d:\\Projects\\OdooXNMIT\\tests\\workOrders.test.js
import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb, auth } from './testUtils.js';

/*
  Scenario:
  1. Create a new MO (draft) -> confirm -> start (so MO status becomes in_progress)
  2. Manually create 2 work orders tied to that MO via direct DB insert (since no public create endpoint yet)
     - Both start as pending
  3. Start first WO -> MO aggregated should become in_progress (already in_progress from MO start, assert unchanged)
  4. Start second WO -> still in_progress
  5. Pause first WO -> MO remains in_progress
  6. Complete first WO (from paused) -> still in_progress (second still in_progress)
  7. Complete second WO -> all WOs done => MO should auto-shift to to_close
  8. Manually complete MO (to_close -> not_assigned)
*/

import pg from 'pg';
import { getAdminToken } from './testUtils.js';

let moId; let wo1; let wo2;

function expectStatus(res, code){ expect(res.status, res.body?.error).toBe(code); }

async function insertWO(mo_id, operation_name){
  const { PGHOST, PGUSER, PGPASSWORD, PGPORT, PGDATABASE } = process.env;
  const pool = new pg.Pool({ host: PGHOST, user: PGUSER, password: PGPASSWORD, port: PGPORT, database: PGDATABASE });
  const r = await pool.query('INSERT INTO work_orders(mo_id, operation_name, status) VALUES($1,$2,$3) RETURNING id', [mo_id, operation_name, 'pending']);
  await pool.end();
  return r.rows[0].id;
}

async function getMO(){
  const res = await auth(api.get(`/mos/${moId}`));
  expectStatus(res,200); return res.body.data;
}

async function getWO(id){
  const res = await auth(api.get(`/wos/${id}`));
  expectStatus(res,200); return res.body.data;
}

describe('Work Orders Transitions & MO Aggregation', () => {
  beforeAll(async () => { await initTestDb(); }, 60000);

  it('creates & starts base MO', async () => {
    const createRes = await auth(api.post('/mos').send({ product_id: 1, quantity: 10 }));
    expectStatus(createRes,201);
    moId = createRes.body.data.id;
    // confirm
    const confirmRes = await auth(api.post(`/mos/${moId}/confirm`));
    expectStatus(confirmRes,200);
    // start
    const startRes = await auth(api.post(`/mos/${moId}/start`));
    expectStatus(startRes,200);
    expect(startRes.body.data.status).toBe('in_progress');
  });

  it('inserts two pending WOs', async () => {
    wo1 = await insertWO(moId,'Assembly');
    wo2 = await insertWO(moId,'Binding');
    const w1 = await getWO(wo1); expect(w1.status).toBe('pending');
    const w2 = await getWO(wo2); expect(w2.status).toBe('pending');
  });

  it('starts first WO -> MO stays in_progress', async () => {
    const res = await auth(api.post(`/wos/${wo1}/start`));
    expectStatus(res,200); expect(res.body.data.status).toBe('in_progress');
    const mo = await getMO(); expect(mo.status).toBe('in_progress');
  });

  it('starts second WO', async () => {
    const res = await auth(api.post(`/wos/${wo2}/start`));
    expectStatus(res,200); expect(res.body.data.status).toBe('in_progress');
    const mo = await getMO(); expect(mo.status).toBe('in_progress');
  });

  it('pauses first WO', async () => {
    const res = await auth(api.post(`/wos/${wo1}/pause`));
    expectStatus(res,200); expect(res.body.data.status).toBe('paused');
    const mo = await getMO(); expect(mo.status).toBe('in_progress');
  });

  it('completes first WO (paused->done)', async () => {
    const res = await auth(api.post(`/wos/${wo1}/complete`));
    expectStatus(res,200); expect(res.body.data.status).toBe('done');
    const mo = await getMO(); expect(mo.status).toBe('in_progress');
  });

  it('completes second WO -> MO moves to to_close', async () => {
    const res = await auth(api.post(`/wos/${wo2}/complete`));
    expectStatus(res,200); expect(res.body.data.status).toBe('done');
    const mo = await getMO(); expect(mo.status).toBe('to_close');
  });

  it('finalizes MO (to_close->not_assigned)', async () => {
    const res = await auth(api.post(`/mos/${moId}/complete`));
    expectStatus(res,200); expect(res.body.data.status).toBe('not_assigned');
  });
});
