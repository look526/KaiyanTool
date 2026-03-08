# Tasks: 增强登录功能安全性

## 阶段一：紧急安全修复（1-2周）

### Block 1: 登录失败锁定机制

- [x] **1.1** 创建 `apps/api/src/services/login-attempts.service.ts` 文件
- [x] **1.2** 实现 `LoginAttemptsService` 类，包含以下方法：
  - `recordAttempt(identifier, ip)`: 记录登录尝试
  - `clearAttempts(identifier, ip)`: 清除登录尝试
  - `isLocked(identifier, ip)`: 检查是否被锁定
- [x] **1.3** 配置锁定参数：
  - MAX_ATTEMPTS = 5
  - LOCK_DURATION = 15分钟
  - ATTEMPT_WINDOW = 15分钟
- [x] **1.4** 使用Map存储内存中的登录尝试记录
- [x] **1.5** 实现数据库持久化（创建login_attempts表）
- [x] **1.6** 在 `apps/api/src/controllers/auth.controller.ts` 的login方法中集成：
  - 登录前检查是否被锁定
  - 记录每次登录尝试
  - 登录成功后清除尝试记录
- [ ] **1.7** 添加单元测试：验证锁定机制正确性
- [ ] **1.8** 手动测试：尝试5次失败登录，验证是否锁定

### Block 2: 增强Rate Limit机制

- [x] **2.1** 创建 `apps/api/src/middleware/user-rate-limit.middleware.ts` 文件
- [x] **2.2** 实现 `createUserRateLimit` 工厂函数：
  - 支持自定义keyGenerator
  - 优先使用用户ID，其次使用IP
- [x] **2.3** 创建 `userAuthRateLimit` 配置：
  - windowMs = 15分钟
  - max = 5次
  - 消息："登录尝试过于频繁，请15分钟后再试"
- [x] **2.4** 创建 `userApiRateLimit` 配置：
  - windowMs = 15分钟
  - max = 100次
  - 消息："API请求过于频繁，请15分钟后再试"
- [x] **2.5** 更新 `apps/api/src/routes/auth.routes.ts`：
  - 登录接口使用userAuthRateLimit
  - 注册接口使用userAuthRateLimit
- [ ] **2.6** 更新 `apps/api/src/index.ts`：
  - 全局使用userApiRateLimit
- [ ] **2.7** 添加单元测试：验证基于用户的Rate Limit
- [ ] **2.8** 手动测试：使用不同IP但同一用户测试Rate Limit

### Block 3: CSRF防护

- [x] **3.1** 创建 `apps/api/src/middleware/csrf.middleware.ts` 文件
- [x] **3.2** 实现 `generateCsrfToken` 函数：使用crypto生成32字节随机token
- [x] **3.3** 实现 `csrfMiddleware` 中间件：
  - GET/HEAD/OPTIONS请求：生成token并通过响应头返回
  - POST/PUT/DELETE/PATCH请求：验证token
  - 支持token过期机制（24小时）
  - 定期清理过期token（每小时）
- [x] **3.4** 使用Map存储CSRF token
- [x] **3.5** 更新 `apps/api/src/index.ts`：
  - 在路由前应用csrfMiddleware
- [x] **3.6** 创建 `apps/web/src/lib/csrf.ts` 文件
- [x] **3.7** 实现CSRF token获取和发送逻辑：
  - getCsrfToken(): 从响应头获取token
  - 缓存token避免重复请求
- [x] **3.8** 更新 `apps/web/src/lib/api-client.ts`：
  - 在POST/PUT/DELETE/PATCH请求中添加X-CSRF-Token头
  - 在请求前调用getCsrfToken
- [ ] **3.9** 添加单元测试：验证CSRF token生成和验证
- [ ] **3.10** 手动测试：验证CSRF防护有效性

### Block 4: XSS防护

- [x] **4.1** 安装依赖：`npm install dompurify @types/dompurify`
- [x] **4.2** 创建 `apps/web/src/utils/xss.ts` 文件
- [x] **4.3** 实现 `sanitizeHtml` 函数：
  - 使用DOMPurify.sanitize
  - 配置允许的标签和属性
- [x] **4.4** 实现 `sanitizeInput` 函数：
  - 基本HTML实体转义
  - 处理常见特殊字符
- [ ] **4.5** 在登录页面中使用sanitizeInput
- [ ] **4.6** 在所有用户输入显示处使用sanitizeHtml
- [ ] **4.7** 添加单元测试：验证XSS过滤有效性
- [ ] **4.8** 安全测试：注入XSS payload验证过滤效果

### Block 5: 会话固定防护

- [x] **5.1** 修改 `apps/api/src/controllers/auth.controller.ts` 的login方法
- [x] **5.2** 在登录开始时检查现有会话：
  - 检查req.cookies?.sessionId
  - 如果存在，删除旧会话
- [x] **5.3** 清除旧cookie：res.clearCookie('sessionId')
- [x] **5.4** 生成新会话ID和token
- [x] **5.5** 设置新cookie
- [ ] **5.6** 更新 `apps/api/src/middleware/auth.middleware.ts`：
  - 验证会话ID是否已更换
- [ ] **5.7** 添加单元测试：验证会话固定防护
- [ ] **5.8** 安全测试：验证会话固定攻击被阻止

### Block 6: Cookie安全增强

- [x] **6.1** 创建 `apps/api/src/config/cookies.ts` 文件
- [x] **6.2** 实现 `getCookieOptions(maxAge)` 函数：
  - httpOnly: true
  - secure: NODE_ENV === 'production'
  - sameSite: 'strict' (从lax改为strict)
  - maxAge: 传入参数
  - path: '/'
  - domain: process.env.COOKIE_DOMAIN
- [x] **6.3** 更新 `apps/api/src/controllers/auth.controller.ts`：
  - 所有cookie设置使用getCookieOptions
  - 替换硬编码的cookie配置
- [ ] **6.4** 更新 `apps/api/src/middleware/auth.middleware.ts`：
  - 清除cookie使用getCookieOptions
- [x] **6.5** 添加环境变量COOKIE_DOMAIN到.env.example
- [ ] **6.6** 添加单元测试：验证Cookie配置
- [ ] **6.7** 手动测试：检查浏览器中的Cookie设置

### Block 7: 密码强度增强

- [x] **7.1** 创建 `apps/web/src/utils/validation.ts` 文件
- [x] **7.2** 实现 `validateEmail` 函数：邮箱格式验证
- [x] **7.3** 实现 `validatePasswordStrength` 函数：
  - 检查长度（至少8位）
  - 检查大写字母
  - 检查小写字母
  - 检查数字
  - 检查特殊字符
  - 返回强度评分和反馈
- [x] **7.4** 实现 `validateLoginForm` 函数：
  - 验证邮箱和密码
  - 返回错误信息对象
- [x] **7.5** 更新 `apps/api/src/controllers/auth.controller.ts`：
  - 注册时密码验证：min(8)改为min(8)并添加复杂度检查
  - 登录时密码验证：保持不变
- [ ] **7.6** 更新 `apps/web/src/pages/LoginPage.tsx`：
  - 添加实时密码强度检查
  - 显示密码强度指示器
  - 显示密码要求提示
- [ ] **7.7** 更新 `apps/web/src/pages/RegisterPage.tsx`：
  - 添加实时密码强度检查
  - 显示密码强度指示器
- [ ] **7.8** 添加单元测试：验证密码强度规则
- [ ] **7.9** 手动测试：测试各种密码组合

## 阶段二：安全加固（2-3周）

### Block 8: 审计日志

- [ ] **8.1** 创建 `apps/api/src/services/audit.service.ts` 文件
- [ ] **8.2** 实现 `AuditService` 类，包含以下方法：
  - `log(data)`: 记录审计日志
  - `getUserLogs(userId, limit)`: 获取用户审计日志
- [ ] **8.3** 定义AuditLogData接口：
  - userId, action, details, ip, userAgent, success, timestamp
- [ ] **8.4** 创建Prisma模型：AuditLog
- [ ] **8.5** 在登录成功时记录审计日志：
  - action: 'LOGIN'
  - 包含rememberMe信息
- [ ] **8.6** 在登录失败时记录审计日志：
  - action: 'LOGIN_FAILED'
  - 包含错误信息
- [ ] **8.7** 在登出时记录审计日志：
  - action: 'LOGOUT'
- [ ] **8.8** 创建审计日志查询接口：
  - GET /api/audit/logs?userId=xxx
  - 需要管理员权限
- [ ] **8.9** 添加单元测试：验证审计日志记录
- [ ] **8.10** 手动测试：验证日志记录完整性

### Block 9: 并发会话控制

- [ ] **9.1** 创建 `apps/api/src/services/session-limit.service.ts` 文件
- [ ] **9.2** 实现 `SessionLimitService` 类，包含以下方法：
  - `checkSessionLimit(userId)`: 检查会话限制
  - `revokeOldestSession(userId)`: 撤销最旧会话
- [ ] **9.3** 配置MAX_SESSIONS = 5
- [ ] **9.4** 更新 `apps/api/src/controllers/auth.controller.ts` 的login方法：
  - 登录前检查会话限制
  - 超出限制时撤销最旧会话
- [ ] **9.5** 创建会话管理接口：
  - GET /api/auth/sessions: 获取所有活跃会话
  - DELETE /api/auth/sessions/:id: 撤销指定会话
  - DELETE /api/auth/sessions/all: 撤销所有会话
- [ ] **9.6** 创建会话管理页面（前端）：
  - apps/web/src/pages/SessionsPage.tsx
  - 显示所有活跃会话
  - 支持撤销会话
- [ ] **9.7** 添加单元测试：验证会话限制
- [ ] **9.8** 手动测试：测试并发登录和会话管理

### Block 10: 会话缓存

- [ ] **10.1** 安装依赖：`npm install node-cache @types/node-cache`
- [ ] **10.2** 创建 `apps/api/src/services/session-cache.service.ts` 文件
- [ ] **10.3** 实现 `SessionCache` 类，包含以下方法：
  - `set(key, value, ttl)`: 设置缓存
  - `get<T>(key)`: 获取缓存
  - `del(key)`: 删除缓存
  - `flush()`: 清空所有缓存
- [ ] **10.4** 配置缓存参数：
  - stdTTL: 5分钟
  - checkperiod: 1分钟
  - useClones: false
- [ ] **10.5** 更新 `apps/api/src/middleware/auth.middleware.ts`：
  - 先从缓存获取会话
  - 缓存未命中时查询数据库
  - 查询结果存入缓存
- [ ] **10.6** 更新 `apps/api/src/controllers/auth.controller.ts`：
  - 登录成功后清除用户旧缓存
  - 登出时清除缓存
- [ ] **10.7** 添加缓存监控：记录缓存命中率
- [ ] **10.8** 添加单元测试：验证缓存逻辑
- [ ] **10.9** 性能测试：验证缓存效果（命中率 > 80%）

## 阶段三：前端优化（1-2周）

### Block 11: 客户端表单验证

- [ ] **11.1** 完善 `apps/web/src/utils/validation.ts`：
  - 添加更多验证规则
  - 添加错误消息常量
- [ ] **11.2** 创建 `apps/web/src/components/login/LoginForm.tsx` 组件
- [ ] **11.3** 实现实时验证：
  - 邮箱格式检查（onBlur）
  - 密码强度检查（onChange）
  - 提交前完整验证
- [ ] **11.4** 实现错误状态管理：
  - errors状态对象
  - touched状态对象
  - 实时错误显示
- [ ] **11.5** 更新 `apps/web/src/pages/LoginPage.tsx`：
  - 使用新的LoginForm组件
  - 集成验证逻辑
- [ ] **11.6** 更新 `apps/web/src/pages/RegisterPage.tsx`：
  - 使用新的验证逻辑
- [ ] **11.7** 添加单元测试：验证表单验证
- [ ] **11.8** 手动测试：测试各种错误场景

### Block 12: 登录页面优化

- [ ] **12.1** 调用ui-refactor skill分析登录页面
- [ ] **12.2** 使用ui-refactor重构登录页面
- [ ] **12.3** 提取可复用组件：
  - GlassButton
  - GlassInput
  - GlassCard
- [ ] **12.4** 应用Glassmorphism设计风格：
  - 毛玻璃效果
  - 统一颜色系统
  - 统一圆角规范
- [ ] **12.5** 修复window.location.href问题：
  - 使用React Router的navigate
  - 传递状态
- [ ] **12.6** 改进错误提示：
  - 使用Toast组件
  - 显示详细错误信息
- [ ] **12.7** 改进加载状态：
  - 添加loading spinner
  - 禁用提交按钮
- [ ] **12.8** 改进响应式设计：
  - 移动端适配
  - 平板适配
- [ ] **12.9** 添加单元测试：验证页面功能
- [ ] **12.10** 手动测试：测试各种设备和浏览器

## 阶段四：测试与部署（1周）

### 集成测试

- [ ] **13.1** 编写登录流程集成测试
- [ ] **13.2** 编写安全功能集成测试
- [ ] **13.3** 编写性能测试脚本
- [ ] **13.4** 执行所有集成测试

### 安全测试

- [ ] **13.5** 暴力破解测试：使用Hydra测试登录
- [ ] **13.6** CSRF攻击测试：使用CSRF POC工具
- [ ] **13.7** XSS攻击测试：注入XSS payload
- [ ] **13.8** 会话固定测试：验证会话ID更换
- [ ] **13.9** Cookie安全测试：检查Cookie属性
- [ ] **13.10** 修复发现的安全问题

### 性能测试

- [ ] **13.11** 响应时间测试：使用Apache Bench
  - 目标：P95 < 500ms, P99 < 1000ms
- [ ] **13.12** 并发测试：100个并发用户
- [ ] **13.13** 缓存效果测试：
  - 目标：缓存命中率 > 80%
- [ ] **13.14** 优化性能问题

### 文档与部署

- [ ] **13.15** 更新AGENTS.md：
  - 添加安全规范
  - 添加登录相关最佳实践
- [ ] **13.16** 编写部署文档：
  - 环境变量配置
  - 数据库迁移
  - 验证步骤
- [ ] **13.17** 创建回滚计划
- [ ] **13.18** 部署到测试环境
- [ ] **13.19** 在测试环境执行完整测试
- [ ] **13.20** 部署到生产环境
- [ ] **13.21** 监控生产环境指标
- [ ] **13.22** 归档OpenSpec change

## 依赖说明

### 外部依赖
- node-cache: 会话缓存
- dompurify: XSS防护
- @types/node-cache: TypeScript类型定义
- @types/dompurify: TypeScript类型定义

### 内部依赖
- apps/api/src/lib/prisma: 数据库访问
- apps/api/src/lib/logger: 日志记录
- apps/web/src/lib/api: API客户端
- apps/web/src/contexts/AuthContext: 认证上下文

### 并行任务
以下任务可以并行执行：
- Block 1-7: 后端安全功能（彼此独立）
- Block 8-10: 后端扩展功能（彼此独立）
- Block 11-12: 前端优化（彼此独立）
- Block 13: 测试与部署（所有功能完成后）

### 阻塞任务
- Block 12依赖Block 11（需要验证逻辑）
- Block 13依赖Block 1-12（需要所有功能完成）
