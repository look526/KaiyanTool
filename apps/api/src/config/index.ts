export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  cors: {
    origins: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
    },
    google: {
      apiKey: process.env.GOOGLE_API_KEY || '',
    },
    zhipu: {
      apiKey: process.env.ZHIPU_API_KEY || '',
    },
    antsk: {
      apiKey: process.env.ANTSK_API_KEY || '',
    },
  },
  
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
  },
  
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'kaiyan-encryption-key-32-chars-long',
  },
  
  admin: {
    email: process.env.ADMIN_EMAIL || 'likaiyan@test.com',
    password: process.env.ADMIN_PASSWORD || 'likaiyan',
  },
  
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '104857600', 10),
  },
  
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    apiVersion: process.env.API_VERSION || 'v1',
  },
};

export type Config = typeof config;
