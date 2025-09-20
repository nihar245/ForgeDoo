import { describe, it, beforeAll, expect } from 'vitest';
import { api, initTestDb } from './testUtils.js';

let token;

describe('Auth Extended', () => {
  beforeAll(async () => {
    await initTestDb();
  }, 60000);

  it('signs up a new manager user', async () => {
    const res = await api.post('/auth/signup').send({ name: 'New Manager', email: 'newmanager@example.com', password: 'strongpass123', role: 'manager' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
  });

  it('rejects duplicate signup', async () => {
    const res = await api.post('/auth/signup').send({ name: 'Dup', email: 'newmanager@example.com', password: 'strongpass123', role: 'manager' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('returns current user via /auth/me', async () => {
    const res = await api.get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('newmanager@example.com');
  });

  it('initiates forgot password and verifies OTP flow (dev echo)', async () => {
    const fp = await api.post('/auth/forgot-password').send({ email: 'newmanager@example.com' });
    expect(fp.status).toBe(200);
    const otp = fp.body.dev?.otp; // In dev we expose
    expect(otp).toHaveLength(6);
    const vr = await api.post('/auth/verify-otp').send({ email: 'newmanager@example.com', otp, newPassword: 'changedPass999' });
    expect(vr.status).toBe(200);
    // login with new password
    const li = await api.post('/auth/login').send({ email: 'newmanager@example.com', password: 'changedPass999' });
    expect(li.status).toBe(200);
  });
});
