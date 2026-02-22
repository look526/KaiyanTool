# APM监控配置

## 概述

Kaiyan平台APM（应用性能监控）系统，基于Prometheus、Grafana、AlertManager和Sentry构建。

## 组件说明

### 1. Prometheus
- **作用**: 指标采集和存储
- **端口**: 9090
- **配置**: `monitoring/prometheus/prometheus.yml`
- **告警规则**: `monitoring/prometheus/alerts.yml`

### 2. Grafana
- **作用**: 可视化监控面板
- **端口**: 3000
- **默认账号**: admin/admin
- **仪表盘**: `monitoring/grafana/dashboard-kaiyan-api.json`

### 3. AlertManager
- **作用**: 告警聚合和通知
- **端口**: 9093
- **配置**: `monitoring/alertmanager/alertmanager.yml`

### 4. Sentry
- **作用**: 错误追踪和性能监控
- **配置**: `apps/api/src/lib/sentry.ts`
- **环境变量**: `SENTRY_DSN`

## 快速启动

```bash
cd monitoring
docker-compose up -d
```

访问地址:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- AlertManager: http://localhost:9093

## 告警规则

### API性能告警
- **HTTP错误率**: 5xx错误率超过5%触发警告
- **响应时间**: P95响应时间超过2秒触发警告
- **数据库查询**: P95查询时间超过1秒触发警告

### AI服务告警
- **AI请求失败率**: 失败率超过20%触发严重告警
- **AI响应时间**: P95响应时间超过30秒触发警告

### 系统健康告警
- **服务可用性**: 服务宕机超过1分钟触发严重告警
- **CPU使用率**: 超过80%触发警告
- **内存使用率**: 超过85%触发警告
- **磁盘空间**: 可用空间低于10%触发严重告警

## 监控指标

### HTTP指标
- `kaiyantool_api_http_requests_total`: HTTP请求总数
- `kaiyantool_api_http_request_duration_seconds`: HTTP请求响应时间

### 数据库指标
- `kaiyantool_api_db_query_duration_seconds`: 数据库查询时间

### AI服务指标
- `kaiyantool_api_ai_requests_total`: AI请求总数
- `kaiyantool_api_ai_request_duration_seconds`: AI请求响应时间

### 连接指标
- `kaiyantool_api_active_connections`: 活动连接数

### 队列指标
- `kaiyantool_api_queue_jobs_total`: 队列任务总数
- `kaiyantool_api_queue_jobs_duration_seconds`: 队列任务执行时间

## 配置说明

### Prometheus
编辑 `monitoring/prometheus/prometheus.yml` 修改采集目标:

```yaml
scrape_configs:
  - job_name: 'kaiyan-api'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['kaiyan-api:3001']
```

### AlertManager
编辑 `monitoring/alertmanager/alertmanager.yml` 配置告警通知:

```yaml
receivers:
  - name: 'critical-receiver'
    email_configs:
      - to: 'oncall@kaiyan.com'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
```

### Sentry
设置环境变量:

```bash
export SENTRY_DSN="https://your-dsn@sentry.io/project-id"
export SENTRY_ENVIRONMENT="production"
```

## OpenTelemetry集成

应用已集成OpenTelemetry用于分布式追踪:

- **Trace导出器**: OTLP (生产环境) / Console (开发环境)
- **自动插桩**: Express、HTTP、PostgreSQL、Redis
- **端点**: `http://localhost:4318/v1/traces`

配置环境变量:

```bash
export OTLP_ENDPOINT="http://jaeger:4318"
export NODE_ENV="production"
```

## 故障排查

### Prometheus无法采集指标
1. 检查API服务是否正常运行
2. 确认 `/api/metrics` 端点可访问
3. 查看Prometheus日志: `docker logs kaiyan-prometheus`

### Grafana无法显示数据
1. 确认Prometheus数据源配置正确
2. 检查Grafana和Prometheus网络连通性
3. 验证Prometheus有数据: http://localhost:9090/targets

### 告警未触发
1. 检查AlertManager配置
2. 验证告警规则语法: http://localhost:9093/#/alerts
3. 确认告警路由配置

## 维护建议

1. **定期清理**: Prometheus数据默认保留15天
2. **性能调优**: 根据实际负载调整采集间隔和采样率
3. **告警优化**: 根据实际情况调整告警阈值
4. **监控监控**: 确保监控系统本身的高可用
