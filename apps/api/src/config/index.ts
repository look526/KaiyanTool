export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  cors: {
    origins: process.env.CORS_ORIGIN?.split(',') || (process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']),
    credentials: true,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || '',
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
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    },
    google: {
      apiKey: process.env.GOOGLE_API_KEY || '',
      baseUrl: process.env.GOOGLE_AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
    },
    zhipu: {
      apiKey: process.env.ZHIPU_API_KEY || '',
      baseUrl: process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
    },
    antsk: {
      apiKey: process.env.ANTSK_API_KEY || '',
      baseUrl: process.env.ANTSK_BASE_URL || 'https://api.antsk.com/v1',
    },
  },
  
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
  },
  
  encryption: {
    key: process.env.ENCRYPTION_KEY || '',
  },
  
  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
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

export function validateConfig(): void {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'ENCRYPTION_KEY'];
  const missing: string[] = [];
  
  if (config.nodeEnv === 'production') {
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    if (config.jwt.secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    
    if (config.encryption.key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters in production');
    }
    
    if (config.cors.origins.length === 0) {
      throw new Error('CORS_ORIGIN must be set in production');
    }
  }
  
  if (config.nodeEnv === 'development') {
    const warnings: string[] = [];
    
    if (!config.jwt.secret) {
      warnings.push('JWT_SECRET not set, using insecure default for development');
      config.jwt.secret = 'dev-insecure-secret-key-do-not-use-in-production-32ch';
    }
    
    if (!config.encryption.key) {
      warnings.push('ENCRYPTION_KEY not set, using insecure default for development');
      config.encryption.key = 'dev-encryption-key-32-chars-do-not-use';
    }
    
    if (!config.admin.email || !config.admin.password) {
      warnings.push('ADMIN_EMAIL or ADMIN_PASSWORD not set, admin login will be disabled');
    }
    
    if (warnings.length > 0) {
      console.warn('\n⚠️  Development Configuration Warnings:');
      warnings.forEach(w => console.warn(`   - ${w}`));
      console.warn('');
    }
  }
}

export type Config = typeof config;
