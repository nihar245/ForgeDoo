import { config } from './core/config.js';
import { logger } from './core/logger.js';
import app from './app.js';
// NOTE: Redis temporarily disabled for local development. To re-enable, uncomment the line below
// import { initRedis, shutdownRedis, isRedisReady, isRedisDisabled } from './core/redis.js';

async function start(){
  try {
    // Redis disabled: skip initialization (set REDIS_ENABLED=true in env and restore code to re-enable)
    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server listening on port ${config.port} (redis:disabled)`);
    });
    server.on('error', (err) => {
      if (err.code === 'EACCES') {
        logger.error(`Port ${config.port} requires elevated privileges`);
      } else if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`);
      } else {
        logger.error({ err }, 'Server error');
      }
      process.exit(1);
    });
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
  // Redis disabled: no shutdown required
      server.close(()=> process.exit(0));
      setTimeout(()=> process.exit(1), 8000).unref();
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (e) {
    logger.error({ e }, 'Fatal startup error');
    process.exit(1);
  }
}

start();
