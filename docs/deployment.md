# AI内容创作平台 - 部署文档

## 目录
- [1. 部署架构](#1-部署架构)
- [2. 环境准备](#2-环境准备)
- [3. Docker部署](#3-docker部署)
- [4. 生产环境配置](#4-生产环境配置)
- [5. 监控维护](#5-监控维护)
- [6. 故障排查](#6-故障排查)

---

## 1. 部署架构

```
┌─────────────────────────────────────────────────────┐
│                   Nginx (SSL)                 │
│                   负载均衡 + 反向代理              │
└─────────────────────┬─────────────────────────────┘
                    │ HTTP (80/443)
                    │
        ┌──────────────────────────────────┐
        │      Docker Compose          │
        │                             │
        │  ┌──────────────┬────────┐│
        │  │ API Container│       ││
        │  │ Node.js +   │       ││
        │  │ Express     │       ││
        │  │ :3001       │       ││
        │  └──────────────┴────────┘│
        │                             │
        │  ┌──────────────┬────────┐│
        │  │ Web Container│       ││
        │  │ React + Vite│       ││
        │  │ :3000       │       ││
        │  └──────────────┴────────┘│
        │                             │
        │  ┌──────────────┬────────┐│
        │  │ PostgreSQL   │       ││
        │  │ :5432       │       ││
        │  └──────────────┴────────┘│
        │                             │
        │  ┌──────────────┬────────┐│
        │  │ Redis       │       ││
        │  │ :6379       │       ││
        │  └──────────────┴────────┘│
        └──────────────────────────────────┘
```

---

## 2. 环境准备

### 2.1 服务器要求

| 组件 | 最低配置 | 推荐配置 |
|--------|----------|----------|
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 存储 | 20GB | 50GB+ SSD |
| 操作系统 | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Docker | 24.0+ | 24.0+ |

### 2.2 软件依赖

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装 Nginx
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2.3 域名配置

| 服务 | 域名要求 | 说明 |
|--------|----------|--------|
| API | `api.yourdomain.com` | 后端API |
| Web | `www.yourdomain.com` | 前端应用 |
| 文档 | `docs.yourdomain.com` | API文档 |

---

## 3. Docker部署

### 3.1 创建环境变量文件

**apps/api/.env**：
```env
DATABASE_URL=postgresql://user:password@postgres:5432/kaiyan_platform
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SENTRY_DSN=https://xxx@sentry.io/xxx

NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://www.yourdomain.com

# AI提供商（可选，由用户配置）
# OPENAI_API_KEY=sk-...
# GOOGLE_API_KEY=...
# ZHIPU_API_KEY=...
```

**apps/web/.env**：
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 3.2 Docker Compose配置

**docker-compose.yml**：
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: kaiyan-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: kaiyan_platform
      POSTGRES_USER: kaiyan_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kaiyan_user -d kaiyan_platform"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: kaiyan-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    build: ./apps/api
    container_name: kaiyan-api
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - SENTRY_DSN=${SENTRY_DSN}
      - NODE_ENV=production
      - PORT=3001
      - CORS_ORIGIN=https://www.yourdomain.com
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "3001:3001"
    volumes:
      - ./apps/api:/app
      - ./uploads:/app/uploads
    networks:
      - kaiyan-network

  web:
    build: ./apps/web
    container_name: kaiyan-web
    restart: unless-stopped
    environment:
      - VITE_API_BASE_URL=https://api.yourdomain.com
      - VITE_SENTRY_DSN=${SENTRY_DSN}
    depends_on:
      api:
        condition: service_started
    ports:
      - "3000:80"
    networks:
      - kaiyan-network

volumes:
  postgres-data:
  redis-data:
  uploads:

networks:
  kaiyan-network:
    driver: bridge
```

### 3.3 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f api
docker-compose logs -f web

# 停止服务
docker-compose down

# 停止并删除数据卷（慎用）
docker-compose down -v
```

---

## 4. 生产环境配置

### 4.1 Nginx配置

**/etc/nginx/sites-available/kaiyan-api**：
```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api-docs {
        proxy_pass http://localhost:3001/api-docs;
    }
}

server {
    listen 443 ssl http2;
    server_name www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/www.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.yourdomain.com/privkey.pem;

    root /var/www/kaiyan-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### 4.2 SSL证书配置

```bash
# 使用 Certbot 获取免费 Let's Encrypt 证书
sudo certbot certonly --nginx -d api.yourdomain.com
sudo certbot certonly --nginx -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### 4.3 防火墙配置

```bash
# Ubuntu UFW 防火墙
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 云服务商安全组
# 开放端口：22, 80, 443
```

---

## 5. 监控维护

### 5.1 日志查看

```bash
# API 日志
docker-compose logs -f api --tail=100

# Web 日志
docker-compose logs -f web --tail=100

# PostgreSQL 日志
docker-compose logs postgres

# Redis 日志
docker-compose logs redis
```

### 5.2 性能监控

| 指标 | 监控方式 |
|--------|---------|
| CPU | `docker stats` / `htop` |
| 内存 | `docker stats` / `free -m` |
| 磁盘 | `df -h` / `du -sh` |
| API响应 | `/health` 端点 |
| 数据库连接 | `prisma studio` / 连接池统计 |

### 5.3 告警配置

建议集成告警服务：
- CPU使用率 > 80%
- 内存使用率 > 85%
- 磁盘使用率 > 90%
- API错误率 > 5%
- 数据库连接失败

---

## 6. 故障排查

### 6.1 常见问题

| 问题 | 原因 | 解决方案 |
|------|--------|----------|
| API无法访问 | 端口未开放/防火墙 | 检查UFW和云安全组 |
| 数据库连接失败 | PostgreSQL未启动 | `docker-compose restart postgres` |
| Redis连接失败 | Redis未启动 | `docker-compose restart redis` |
| 文件上传失败 | uploads目录权限 | `chmod 755 uploads` |
| 前端API请求失败 | CORS配置错误 | 检查`CORS_ORIGIN`环境变量 |
| WebSocket断开 | Nginx超时 | 增加`proxy_read_timeout` |

### 6.2 日志调试

```bash
# 实时日志监控
docker-compose logs -f api web

# 进入容器调试
docker exec -it kaiyan-api sh
docker exec -it kaiyan-web sh

# PostgreSQL 查询
docker exec -it kaiyan-postgres psql -U kaiyan_user -d kaiyan_platform

# Redis 操作
docker exec -it kaiyan-redis redis-cli
```

### 6.3 数据备份

```bash
# PostgreSQL 备份
docker exec kaiyan-postgres pg_dump -U kaiyan_user kaiyan_platform > backup_$(date +%Y%m%d).sql

# 数据卷备份
docker run --rm -v kaiyan-postgres-data:/data -v $(pwd):/backup ubuntu tar czf backup-data-$(date +%Y%m%d).tar.gz -C /data .

# 定时备份（cron）
0 2 * * * docker exec kaiyan-postgres pg_dump -U kaiyan_user kaiyan_platform > /backup/kaiyan_$(date +\%Y\%m\%d).sql
```

---

## 4. Kubernetes部署

### 4.1 集群准备

```bash
# 创建命名空间
kubectl create namespace kaiyan

# 创建Secret
kubectl create secret generic kaiyan-secrets \
  --from-literal=database-url="postgresql://kaiyan_user:PASSWORD@postgres:5432/kaiyan_platform?sslmode=require" \
  --from-literal=redis-url="redis://:PASSWORD@redis:6379" \
  --from-literal=encryption-key="32-char-key" \
  --from-literal=jwt-secret="64-char-secret" \
  --from-literal=session-secret="128-char-secret" \
  --from-literal=sentry-dsn="https://your-dsn@sentry.io/project-id" \
  -n kaiyan
```

### 4.2 部署服务

```bash
# 部署数据库
kubectl apply -f kubernetes/postgres-statefulset.yaml -n kaiyan

# 部署API
kubectl apply -f kubernetes/api-deployment.yaml -n kaiyan

# 部署Web
kubectl apply -f kubernetes/web-deployment.yaml -n kaiyan

# 部署Ingress
kubectl apply -f kubernetes/ingress.yaml -n kaiyan
```

### 4.3 查看部署状态

```bash
# 查看所有资源
kubectl get all -n kaiyan

# 查看Pod状态
kubectl get pods -n kaiyan

# 查看日志
kubectl logs -f deployment/kaiyan-api -n kaiyan
kubectl logs -f deployment/kaiyan-web -n kaiyan

# 进入Pod
kubectl exec -it deployment/kaiyan-api -n kaiyan -- sh
```

### 4.4 扩缩容

```bash
# 手动扩容
kubectl scale deployment kaiyan-api --replicas=5 -n kaiyan

# 查看HPA状态
kubectl get hpa -n kaiyan
```

### 4.5 滚动更新

```bash
# 更新镜像
kubectl set image deployment/kaiyan-api kaiyan-api=kaiyan/api:v2.0 -n kaiyan

# 查看更新状态
kubectl rollout status deployment/kaiyan-api -n kaiyan

# 回滚
kubectl rollout undo deployment/kaiyan-api -n kaiyan
```

### 4.6 配置SSL证书

```bash
# 安装cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# 创建ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

---

## 5. 生产环境配置

### 5.1 Nginx配置

使用 [nginx/kaiyan-prod.conf](nginx/kaiyan-prod.conf) 配置文件，包含：
- SSL/TLS配置
- 反向代理和负载均衡
- 安全头
- 限流和速率限制
- 静态资源缓存
- Gzip压缩

### 5.2 SSL证书配置

```bash
# 使用 Certbot 获取免费 Let's Encrypt 证书
sudo certbot certonly --nginx -d api.yourdomain.com
sudo certbot certonly --nginx -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### 5.3 防火墙配置

```bash
# Ubuntu UFW 防火墙
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 云服务商安全组
# 开放端口：22, 80, 443
```

---

## 6. 监控维护

| 变量 | 用途 | 必填 |
|--------|--------|--------|
| `DATABASE_URL` | PostgreSQL连接字符串 | ✅ |
| `REDIS_URL` | Redis连接字符串 | ✅ |
| `JWT_SECRET` | JWT签名密钥 | ✅ |
| `SENTRY_DSN` | Sentry DSN | ✅ |
| `NODE_ENV` | 运行环境 | ✅ |
| `PORT` | API端口 | ❌ |
| `CORS_ORIGIN` | CORS允许源 | ✅ |

### B. 健康检查端点

```bash
# API健康检查
curl https://api.yourdomain.com/health

# 预期响应
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai_providers": "active"
  }
}
```

### C. 升级部署流程

```bash
# 拉取最新代码
git pull origin main

# 构建新镜像
docker-compose build --no-cache

# 滚动更新（无停机）
docker-compose up -d --no-deps --build

# 清理旧镜像
docker image prune -a
```
