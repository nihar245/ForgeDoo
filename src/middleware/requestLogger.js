import { logger } from '../core/logger.js';
import { httpRequestDurationMs } from '../core/metrics.js';

export function requestLogger(req, res, next) {
  const end = httpRequestDurationMs.startTimer();
  const start = Date.now();
  res.on('finish', () => {
    end({ method: req.method, route: req.route ? req.route.path : req.originalUrl, code: res.statusCode });
    logger.info(JSON.stringify({
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start
    }));
  });
  next();
}
