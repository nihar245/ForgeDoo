import { describe, it, expect, beforeAll } from 'vitest';
import { api, initTestDb } from './testUtils.js';

// Docs don't require auth for viewing spec (public docs)
describe('API Docs', () => {
  beforeAll(async () => { await initTestDb(); }, 60000);

  it('serves OpenAPI JSON', async () => {
    const res = await api.get('/docs-json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3/);
    expect(res.body.info.title).toMatch(/Manufacturing API/);
  });

  it('serves Swagger UI HTML', async () => {
    const res = await api.get('/docs');
    expect([200,301]).toContain(res.status);
  });
});
