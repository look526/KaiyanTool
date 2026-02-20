# 腾讯云部署指南

## 部署前准备

### 1. 环境变量配置

在腾讯云服务器上创建 `.env` 文件，配置以下环境变量：

```bash
# 数据库配置
DATABASE_URL="postgresql://user:password@your-db-host:5432/ai_content_platform"

# Redis配置
REDIS_URL="redis://your-redis-host:6379"

# JWT配置
JWT_SECRET="your-very-secure-random-secret-key"
JWT_EXPIRES_IN="7d"

# 服务器配置
PORT=4000
NODE_ENV="production"

# CORS配置（重要！）
# 将your-domain.com替换为你的实际域名或服务器IP
CORS_ORIGIN="https://your-domain.com"

# OSS配置（可选，用于文件存储）
OSS_ENDPOINT="https://your-oss-endpoint.com"
OSS_ACCESS_KEY_ID="your-access-key-id"
OSS_ACCESS_KEY_SECRET="your-access-key-secret"
OSS_BUCKET="your-bucket-name"

# AI服务配置
ANTSK_API_KEY="your-antsk-api-key"
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_API_KEY="your-google-api-key"
ZHIPU_API_KEY="your-zhipu-api-key"

# Sentry配置（可选）
SENTRY_DSN="your-sentry-dsn"
SENTRY_ENVIRONMENT="production"
```

### 2. 安装依赖

```bash
cd apps/api
npm install --production
```

### 3. 构建项目

```bash
npm run build
```

## 部署方式

### 方式一：使用PM2部署（推荐）

#### 1. 安装PM2

```bash
npm install -g pm2
```

#### 2. 启动服务

```bash
cd apps/api
pm2 start ecosystem.config.js
```

#### 3. 创建PM2配置文件

在项目根目录创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'kaiyan-api',
    script: 'npm',
    args: 'start',
    cwd: './apps/api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
```

#### 4. PM2常用命令

```bash
# 查看日志
pm2 logs kaiyan-api

# 重启服务
pm2 restart kaiyan-api

# 停止服务
pm2 stop kaiyan-api

# 查看状态
pm2 status

# 开机自启动
pm2 startup
pm2 save
```

### 方式二：使用Docker部署

#### 1. 创建Dockerfile

在 `apps/api` 目录创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
```

#### 2. 创建docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: ./apps/api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

#### 3. 构建和运行

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f api
```

### 方式三：使用Systemd服务（Linux服务器）

#### 1. 创建服务文件

创建 `/etc/systemd/system/kaiyan-api.service`：

```ini
[Unit]
Description=Kaiyan API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project/apps/api
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=4000
Environment=DATABASE_URL=postgresql://user:password@your-db-host:5432/ai_content_platform
Environment=REDIS_URL=redis://your-redis-host:6379
Environment=JWT_SECRET=your-secret-key
Environment=CORS_ORIGIN=https://your-domain.com

[Install]
WantedBy=multi-user.target
```

#### 2. 启动服务

```bash
# 重载systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start kaiyan-api

# 设置开机自启
sudo systemctl enable kaiyan-api

# 查看状态
sudo systemctl status kaiyan-api

# 查看日志
sudo journalctl -u kaiyan-api -f
```

## 腾讯云Nginx配置

如果使用Nginx作为反向代理，配置如下：

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL证书配置
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    # HTTP重定向到HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # 静态文件（如果有前端）
    location / {
        root /path/to/your/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
}
```

## 腾讯云安全组配置

在腾讯云控制台配置安全组，开放以下端口：

- **HTTP**: 80
- **HTTPS**: 443
- **API端口**: 4000（或你配置的PORT）

## 腾讯云数据库配置

### PostgreSQL配置

1. 在腾讯云购买PostgreSQL实例
2. 配置白名单（允许API服务器IP访问）
3. 获取连接信息：
   - 主机地址
   - 端口（默认5432）
   - 数据库名
   - 用户名和密码

### Redis配置

1. 在腾讯云购买Redis实例
2. 配置白名单
3. 获取连接信息：
   - 主机地址
   - 端口（默认6379）

## 域名配置

1. 在腾讯云购买域名
2. 配置DNS解析：
   - A记录：指向服务器公网IP
   - CNAME记录：如果使用CDN

## SSL证书配置

### 使用腾讯云SSL证书

1. 在腾讯云SSL证书服务申请免费证书
2. 下载证书文件（.pem和.key）
3. 上传到服务器

### 使用Let's Encrypt（免费）

```bash
# 安装certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 监控和日志

### 日志查看

```bash
# PM2日志
pm2 logs kaiyan-api --lines 100

# Docker日志
docker-compose logs -f api --tail=100

# Systemd日志
sudo journalctl -u kaiyan-api -f
```

### 性能监控

推荐使用腾讯云的监控服务：
- 云监控
- 应用性能监控
- 日志服务

## 健康检查

部署后访问健康检查接口：

```bash
curl https://your-domain.com/health
```

预期响应：

```json
{
  "status": "ok",
  "timestamp": "2024-02-21T00:00:00.000Z"
}
```

## 常见问题

### 1. CORS错误

确保 `.env` 中的 `CORS_ORIGIN` 包含你的域名：

```bash
CORS_ORIGIN="https://your-domain.com,http://your-domain.com"
```

### 2. 数据库连接失败

检查：
- 数据库白名单是否正确配置
- DATABASE_URL格式是否正确
- 数据库实例是否运行

### 3. 端口被占用

```bash
# 查看端口占用
netstat -tlnp | grep 4000

# 杀死进程
kill -9 <PID>
```

### 4. 内存不足

增加服务器内存或使用PM2的内存限制：

```javascript
max_memory_restart: '2G'
```

## 更新部署

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install --production

# 重启服务
pm2 restart kaiyan-api
```

## 备份策略

### 数据库备份

```bash
# PostgreSQL备份
pg_dump -h your-db-host -U user -d ai_content_platform > backup.sql
```

### 文件备份

```bash
# 备份上传文件
tar -czf uploads-backup.tar.gz uploads/
```

## 联系支持

如遇到问题，请检查：
1. 服务器日志
2. 数据库连接
3. 网络配置
4. 安全组规则
