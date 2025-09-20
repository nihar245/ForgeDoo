import { createClient } from 'redis';
import { config } from './config.js';
import { logger } from './logger.js';

const url = `redis://${config.redis.host}:${config.redis.port}`;
let client;
let ready = false;
let disabled = !config.redis.enabled;
let lastErrorLogTs = 0;
const ERROR_THROTTLE_MS = 10000; // log at most once per 10s at error level

export function getRedis(){ return client; }
export function isRedisReady(){ return ready && !disabled; }
export function isRedisDisabled(){ return disabled; }

export async function initRedis(){
  if (disabled) {
    logger.warn('Redis disabled via configuration (REDIS_ENABLED=false)');
    return null;
  }
  client = createClient({ url });
  client.on('error', (err) => {
    const now = Date.now();
    const payload = { code: err?.code, message: err?.message };
    if (now - lastErrorLogTs > ERROR_THROTTLE_MS) {
      lastErrorLogTs = now;
      logger.error('Redis client error', payload);
    } else {
      logger.debug('Redis client error (suppressed)', payload);
    }
  });
  client.on('ready', () => {
    ready = true;
    logger.info(`Redis connected (${url})`);
  });
  try {
    await client.connect();
  } catch (e) {
    logger.warn('Redis connection failed, caching disabled', { message: e.message, code: e.code });
    disabled = true;
  }
  return client;
}

export async function shutdownRedis(){
  if (client) {
    try { await client.quit(); } catch { /* ignore */ }
  }
}

export async function cacheGet(key){
  if(!isRedisReady()) return null;
  try {
    const data = await client.get(key);
    if(!data) return null;
    return JSON.parse(data);
  } catch { return null; }
}

export async function cacheSet(key, value, ttlSec){
  if(!isRedisReady()) return;
  try {
    const payload = JSON.stringify(value);
    if (ttlSec) await client.set(key, payload, { EX: ttlSec }); else await client.set(key, payload);
  } catch {/* ignore */}
}

export async function cacheDel(pattern){
  if(!isRedisReady()) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(keys);
  } catch {/* ignore */}
}
