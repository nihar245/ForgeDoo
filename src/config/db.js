import { Pool } from 'pg';
import { config } from '../core/config.js';
import { logger } from '../core/logger.js';

function buildBasePoolConfig(){
  if (config.dbUrl) return { connectionString: config.dbUrl };
  return {
    host: config.pg.host,
    user: config.pg.user,
    password: config.pg.password,
    database: config.pg.database,
    port: config.pg.port
  };
}

let poolConfig = buildBasePoolConfig();
let pool = new Pool(poolConfig);

// Log initial connectivity once
pool.connect().then(client => {
  client.release();
  logger.info(`PostgreSQL connected (host=${poolConfig.host || 'url'}, db=${poolConfig.database})`);
}).catch(err => {
  logger.error({ err }, 'PostgreSQL initial connection failed');
});

export async function setDatabase(database){
  if(!database || database === poolConfig.database) return; // nothing to do
  try { await pool.end(); } catch { /* ignore */ }
  poolConfig = { ...poolConfig, database };
  pool = new Pool(poolConfig);
  logger.info(`DB pool switched to database: ${database}`);
}

export { pool };

export async function query(sql, params) {
  const start = Date.now();
  const res = await pool.query(sql, params);
  const duration = Date.now() - start;
  if (duration > 200) {
    logger.debug('slow query %dms %s', duration, sql);
  }
  return res;
}
