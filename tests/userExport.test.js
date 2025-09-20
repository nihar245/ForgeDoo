// filepath: d:\\Projects\\OdooXNMIT\\tests\\userExport.test.js
import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb, auth } from './testUtils.js';

function expectStatus(res, code){ expect(res.status, res.body?.error).toBe(code); }

let sampleUserId;

describe('User Export (PDF & XLSX)', () => {
  beforeAll(async () => {
    await initTestDb();
    const res = await auth(api.get('/users'));
    expectStatus(res,200);
    sampleUserId = res.body.users[0].id;
  }, 60000);

  it('exports user as PDF', async () => {
    const res = await auth(api.get(`/users/${sampleUserId}/export`).buffer().parse(binaryParser));
    expectStatus(res,200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.body.slice(0,4).toString()).toBe('%PDF');
  });

  it('exports user as XLSX', async () => {
    const res = await auth(api.get(`/users/${sampleUserId}/export?format=xlsx`).buffer().parse(binaryParser));
    expectStatus(res,200);
    expect(res.headers['content-type']).toMatch(/sheet/);
    // XLSX (zip) starts with PK\x03\x04
    expect(res.body.slice(0,2).toString()).toBe('PK');
  });

  it('rejects unsupported format', async () => {
    const res = await auth(api.get(`/users/${sampleUserId}/export?format=csv`));
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('404 for missing user', async () => {
    const res = await auth(api.get('/users/999999/export').buffer().parse(binaryParser));
    expect(res.status).toBe(404);
  });
});

// Binary body parser for supertest
function binaryParser(res, callback) {
  res.setEncoding('binary');
  let data = '';
  res.on('data', function (chunk) { data += chunk; });
  res.on('end', function () { callback(null, Buffer.from(data, 'binary')); });
}
