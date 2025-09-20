import pg from 'pg';
import request from 'supertest';
import app from '../src/app.js';
import { setDatabase } from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// Create a new Pool for tests using TEST_ env or fallback to normal with suffix
const {
  PGHOST, PGUSER, PGPASSWORD, PGPORT, PGDATABASE
} = process.env;

const baseDb = (PGDATABASE || 'app').replace(/["]+/g,'');
// Use per-worker database to avoid concurrent migration races
const workerId = process.env.VITEST_WORKER_ID || '0';
const testDbName = process.env.PGTEST_DATABASE || `${baseDb}_test_${workerId}`;

let adminToken = null;
let initialized = false;
let initializingPromise = null;

export async function initTestDb(){
  if(initialized) return; // already ready for this worker
  if(initializingPromise) return initializingPromise;
  initializingPromise = (async () => {
    const adminPool = new pg.Pool({ host: PGHOST, user: PGUSER, password: PGPASSWORD, database: 'postgres', port: PGPORT });
    await adminPool.query(`CREATE DATABASE "${testDbName}" WITH TEMPLATE=template0 ENCODING 'UTF8'`)
      .catch(()=>{}); // ignore if exists
    await adminPool.end();
    process.env.PGDATABASE = testDbName;
    await setDatabase(testDbName);
    await runMigrations();
    await seedAuthUser();
    initialized = true;
  })();
  return initializingPromise;
}

async function runMigrations(){
  const migrationsDir = path.join(process.cwd(),'src','config','migrations');
  const files = fs.readdirSync(migrationsDir).filter(f=>f.endsWith('.sql')).sort();
  const pool = new pg.Pool({ host: PGHOST, user: PGUSER, password: PGPASSWORD, database: testDbName, port: PGPORT });
  for(const f of files){
    const sql = fs.readFileSync(path.join(migrationsDir,f),'utf8');
    await pool.query(sql);
  }
  await pool.end();
}

async function seedAuthUser(){
  // Directly insert or rely on migration user id 1 and sign JWT
  const pool = new pg.Pool({ host: PGHOST, user: PGUSER, password: PGPASSWORD, database: testDbName, port: PGPORT });
  const r = await pool.query('SELECT id, role FROM users ORDER BY id ASC LIMIT 1');
  let userId = 1; let role = 'owner/admin';
  if(r.rowCount){ userId = r.rows[0].id; role = r.rows[0].role || role; }
  await pool.end();
  const secret = process.env.JWT_SECRET || 'change_me';
  // Include userId key (used by requireAuth) while keeping sub for any legacy references
  adminToken = jwt.sign({ sub: userId, userId, role }, secret, { expiresIn: '15m' });
}

export function getAdminToken(){ return adminToken; }

export function auth(req){
  const token = getAdminToken();
  if(token) return req.set('Authorization', `Bearer ${token}`);
  return req;
}

export const api = request(app);
