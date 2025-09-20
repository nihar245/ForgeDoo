import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV === 'production'),
  port: parseInt(process.env.PORT || '4000', 10),
  dbUrl: process.env.DATABASE_URL || undefined,
  pg: {
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'globetrotter',
    port: parseInt(process.env.PGPORT || '5432',10)
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379',10),
    ttlSec: parseInt(process.env.REDIS_CACHE_TTL || '60',10),
    enabled: (process.env.REDIS_ENABLED || 'true') === 'true'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    accessTtlMin: parseInt(process.env.ACCESS_TOKEN_TTL_MIN || '15',10),
    refreshTtlDays: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '7',10)
  },
  rateLimit: {
    login: parseInt(process.env.RATE_LIMIT_LOGIN || '10',10),
    windowSec: parseInt(process.env.RATE_LIMIT_WINDOW || '60',10)
  },
  demo: {
    email: process.env.DEMO_EMAIL,
    password: process.env.DEMO_PASSWORD
  },
  seed: {
    users: parseInt(process.env.USERS || '0',10),
    tripsPerUser: parseInt((process.env.TRIPS_PER_USER || '0').toString().split('-')[0],10) // legacy leftover; not used now
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  mail: {
    enabled: (process.env.MAIL_ENABLED === 'true'),
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587',10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM || 'no-reply@example.com'
  }
};
