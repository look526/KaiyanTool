# 腾讯云部署指南

本文档详细介绍如何将 AI 内容创作平台部署到腾讯云上。

## 📋 目录

1. [准备工作](#准备工作)
2. [购买云服务器](#购买云服务器)
3. [环境配置](#环境配置)
4. [项目部署](#项目部署)
5. [域名配置](#域名配置)
6. [SSL 证书](#ssl-证书)
7. [CDN 配置](#cdn-配置)
8. [监控告警](#监控告警)
9. [备份恢复](#备份恢复)

---

## 准备工作

### 1. 注册腾讯云账号

1. 访问 [腾讯云官网](https://cloud.tencent.com)
2. 完成账号注册和实名认证
3. 开通需要的云服务

### 2. 准备本地环境

```bash
# 检查 Node.js 版本
node --version  # 需要 v18+

# 检查pnpm版本
pnpm --version  # 需要 v8+

# 安装pnpm（如果未安装）
npm install -g pnpm

# 克隆代码
git clone <your-repo-url>
cd kaiyanTool
```

---

## 购买云服务器

### 1. 选择配置

推荐配置（根据项目规模选择）：

#### 开发/测试环境
| 配置项 | 规格 |
|--------|------|
| CPU | 2 核 |
| 内存 | 4 GB |
| 带宽 | 5 Mbps |
| 系统盘 | 50 GB SSD |
| 地区 | 广州/上海 |

#### 生产环境
| 配置项 | 规格 |
|--------|------|
| CPU | 4 核 |
| 内存 | 16 GB |
| 带宽 | 10 Mbps |
| 系统盘 | 100 GB SSD |
| 数据盘 | 200 GB SSD |

### 2. 购买步骤

1. 进入 [云服务器 CVM 控制台](https://console.cloud.tencent.com/cvm)
2. 点击「新建」
3. 选择配置：
   - **地域**：选择离用户最近的地区
   - **可用区**：选择随机或指定可用区
   - **实例类型**：标准型 S5/S6
   - **镜像**：Ubuntu 22.04 LTS
4. 设置登录密码
5. 安全组放行端口：80, 443, 22, 3000, 5000
6. 购买后获取公网 IP

---

## 环境配置

### 1. 连接服务器

```bash
# 使用 SSH 连接
ssh root@<你的公网IP>

# 如果使用密码认证
ssh root@<你的公网IP>
# 输入购买时设置的密码
```

### 2. 安装基础依赖

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 验证安装
node --version
npm --version
docker --version
docker-compose --version
```

### 3. 配置防火墙

```bash
# 放行必要端口
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # 前端
ufw allow 5000/tcp  # 后端
ufw enable
```

---

## 项目部署

### 1. 安装基础依赖

```bash
# 安装 Git
apt install -y git

# 安装 Nginx
apt install -y nginx

# 安装其他工具
apt install -y unzip curl wget
```

### 2. 克隆项目

```bash
# 创建部署目录
mkdir -p /opt/kaiyanTool
cd /opt/kaiyanTool

# 克隆代码（使用你的仓库地址）
git clone https://github.com/your-username/kaiyanTool.git .

# 安装依赖
pnpm install
```

### 3. 配置环境变量

```bash
# 创建环境变量文件
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 编辑生产环境配置
nano apps/api/.env
```

#### 后端环境变量

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kaiyan"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN=7d

# AI Providers
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
# 其他 API Keys

# OSS Storage
OSS_ACCESS_KEY_ID="your-oss-key"
OSS_ACCESS_KEY_SECRET="your-oss-secret"
OSS_REGION="ap-guangzhou"
OSS_BUCKET="your-bucket-name"

# App URL
NEXT_PUBLIC_API_URL="https://api.your-domain.com"
```

#### 前端环境变量

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 4. 构建项目

```bash
# 构建所有应用
pnpm build

# 或分别构建
cd apps/api && npm run build
cd ../web && npm run build
```

### 5. 使用 Docker 部署

#### 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: kaiyan-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: kaiyan
      POSTGRES_PASSWORD: your-secure-password
      POSTGRES_DB: kaiyan
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - kaiyan-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kaiyan"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: kaiyan-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - kaiyan-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 后端 API
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: kaiyan-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://kaiyan:your-secure-password@postgres:5432/kaiyan
      REDIS_URL: redis://redis:6379
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - kaiyan-network

  # 前端
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: kaiyan-web
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - api
    networks:
      - kaiyan-network

networks:
  kaiyan-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

#### 创建后端 Dockerfile

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 5000

CMD ["node", "dist/main.js"]
```

#### 创建前端 Dockerfile

```dockerfile
# apps/web/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

#### 部署命令

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止所有服务
docker-compose down
```

---

## 域名配置

### 1. 购买域名

1. 进入 [腾讯云域名控制台](https://console.cloud.tencent.com/domain)
2. 搜索并购买域名

### 2. 域名备案

> ⚠️ 如果使用中国内地区域，需要完成 ICP 备案

1. 进入 [腾讯云备案控制台](https://console.cloud.tencent.com/beian)
2. 按提示提交备案材料
3. 等待审核（通常 1-2 周）

### 3. 配置 DNS

1. 进入域名管理
2. 添加记录：
   ```
   # A 记录
   @       A       <你的服务器公网IP>
   www     A       <你的服务器公网IP>
   
   # API 子域名
   api     A       <你的服务器公网IP>
   ```

---

## SSL 证书

### 1. 申请免费证书

1. 进入 [SSL 证书控制台](https://console.cloud.tencent.com/ssl)
2. 点击「申请免费证书」
3. 填写域名信息
4. 验证域名所有权
5. 下载证书文件

### 2. 配置 Nginx

```nginx
# /etc/nginx/sites-available/kaiyan

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com api.your-domain.com;
    return 301 https://$host$request_uri;
}

# 前端 HTTPS 配置
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/your-domain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API HTTPS 配置
server {
    listen 443 ssl;
    server_name api.your-domain.com;

    ssl_certificate /etc/nginx/ssl/api.your-domain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/api.your-domain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/kaiyan /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载 Nginx
nginx -s reload
```

---

## CDN 配置

### 1. 创建 CDN 加速域名

1. 进入 [CDN 控制台](https://console.cloud.tencent.com/cdn)
2. 点击「添加域名」
3. 配置：
   - **域名**：static.your-domain.com
   - **源站类型**：自有源
   - **源站地址**：your-domain.com
   - **加速区域**：中国大陆

### 2. 配置 CDN 回源

```javascript
// CDN 源站配置
{
  "source": {
    "type": "domain",
    "domain": "your-origin-server.com"
  },
  "cache": {
    "key": {
      "full_url_cache": "on"
    },
    "rules": [
      {
        "type": "path",
        "path": ["/_next/static/*"],
        "cache": {
          "duration": "30d"
        }
      },
      {
        "type": "path", 
        "path": ["/images/*"],
        "cache": {
          "duration": "7d"
        }
      }
    ]
  }
}
```

### 3. 更新 DNS

```
# 添加 CNAME 记录
static   CNAME   <your-cdn-domain>.cdn.dnsv1.com
```

---

## 监控告警

### 1. 安装监控工具

```bash
# 安装 Node Exporter（服务器监控）
docker run -d \
  --net="host" \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  prom/node-exporter:latest \
  --path.rootfs=/host
```

### 2. 配置云监控

1. 进入 [云监控控制台](https://console.cloud.tencent.com/monitor)
2. 创建告警策略：
   - CPU 使用率 > 80%
   - 内存使用率 > 85%
   - 磁盘使用率 > 90%
   - 网站不可访问
3. 配置通知渠道（短信/邮件/微信）

### 3. 创建监控面板

```json
{
  "panels": [
    {
      "title": "服务器状态",
      "metrics": ["cpu_util", "mem_util", "disk_util"]
    },
    {
      "title": "请求统计",
      "metrics": ["requests_total", "request_latency"]
    },
    {
      "title": "错误率",
      "metrics": ["error_rate"]
    }
  ]
}
```

---

## 备份恢复

### 1. 自动备份数据库

```bash
# 创建备份脚本
cat > /opt/backup.sh << 'EOF'
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
CONTAINER="kaiyan-postgres"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker exec $CONTAINER pg_dump -U kaiyan kaiyan | gzip > $BACKUP_DIR/kaiyan_$DATE.sql.gz

# 保留最近 7 天的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# 上传到腾讯云 COS（可选）
# coscmd upload $BACKUP_DIR/kaiyan_$DATE.sql.gz /backups/
EOF

chmod +x /opt/backup.sh

# 添加定时任务
crontab -e
# 添加以下内容：
# 0 2 * * * /opt/backup.sh  # 每天凌晨2点备份
```

### 2. 恢复数据

```bash
# 从备份恢复
zcat /opt/backups/kaiyan_20240115_020000.sql.gz | docker exec -i kaiyan-postgres psql -U kaiyan -d kaiyan
```

### 3. 腾讯云 COS 备份

```bash
# 安装 COS CMD
pip install coscmd

# 配置
coscmd config -a <SECRET_ID> -s <SECRET_KEY> -b <BUCKET_NAME> -r <REGION>

# 上传备份
coscmd upload /opt/backups/kaiyan_$(date +%Y%m%d).sql.gz /backups/
```

---

## 常用命令速查

```bash
# 服务器连接
ssh root@<公网IP>

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f api
docker-compose logs -f web

# 重启服务
docker-compose restart

# 更新部署
git pull
pnpm install
pnpm build
docker-compose up -d --build

# 数据库备份
docker exec kaiyan-postgres pg_dump -U kaiyan kaiyan > backup.sql

# 查看资源使用
docker stats

# 清理资源
docker system prune -af
```

---

## 故障排查

### 1. 服务无法启动

```bash
# 检查端口占用
netstat -tlnp | grep :3000

# 检查 Docker 状态
docker-compose logs

# 检查配置文件
docker-compose config
```

### 2. 数据库连接失败

```bash
# 检查数据库状态
docker exec -it kaiyan-postgres psql -U kaiyan

# 测试连接
psql -h localhost -U kaiyan -d kaiyan
```

### 3. 内存不足

```bash
# 查看内存使用
free -h

# 查看 Docker 内存
docker stats

# 清理 Docker
docker system prune -af --volumes
```

---

## 生产环境检查清单

- [ ] 域名已备案（如果使用中国内地区域）
- [ ] SSL 证书已配置
- [ ] 防火墙规则已设置
- [ ] 数据库已配置密码
- [ ] JWT Secret 已更改
- [ ] API Keys 已配置
- [ ] 监控告警已设置
- [ ] 自动备份已配置
- [ ] 日志系统已配置
- [ ] CDN 已启用
- [ ] 性能测试通过

---

## 技术支持

如遇到问题：

1. 查看日志：`docker-compose logs`
2. 检查 [常见问题](#故障排查)
3. 提交 [GitHub Issue](https://github.com/your-username/kaiyanTool/issues)
