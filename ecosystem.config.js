module.exports = {
  apps: [{
    name: 'kaiyan-api',
    script: 'npm',
    args: 'start',
    cwd: './apps/api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgresql://user:password@localhost:5432/ai_content_platform',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'your-secret-key-here',
      CORS_ORIGIN: 'https://your-domain.com'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
}
