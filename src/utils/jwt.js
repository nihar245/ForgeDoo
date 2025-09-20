import jwt from 'jsonwebtoken';
import { config } from '../core/config.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change';
// Access TTL derived from config (minutes) fallback 15; existing default previously 1h
const ACCESS_TTL = `${config.jwt.accessTtlMin || 60}m`;
const REFRESH_TTL = `${config.jwt.refreshTtlDays || 7}d`;

export function signAccess(payload) {
  return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefresh(payload) {
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export function verifyAccess(token){
  const p = verifyToken(token); if(!p || p.type !== 'access') return null; return p;
}

export function verifyRefresh(token){
  const p = verifyToken(token); if(!p || p.type !== 'refresh') return null; return p;
}
