import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'mf_' });

export const httpRequestDurationMs = new client.Histogram({
  name: 'mf_http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [10, 25, 50, 100, 250, 500, 1000, 2000]
});
register.registerMetric(httpRequestDurationMs);

export { register };
