# Change: 增强登录功能安全性

## Why

当前项目的登录功能存在多个安全隐患和性能问题：

### 安全问题（高风险）
1. **缺少登录失败锁定机制**：攻击者可以无限次尝试登录，存在暴力破解风险
2. **Rate Limit基于IP**：攻击者可以通过代理绕过限制
3. **缺少CSRF防护**：存在跨站请求伪造攻击风险
4. **缺少XSS防护**：用户输入未经过滤，存在XSS攻击风险
5. **会话固定攻击风险**：登录后没有更换会话ID
6. **Cookie安全配置不完整**：sameSite使用lax而非strict
7. **密码强度要求不足**：仅要求6位，允许弱密码
8. **缺少审计日志**：无法追踪安全事件
9. **缺少并发会话控制**：同一用户可以创建无限会话

### 性能问题
1. **每次请求都查询数据库**：没有缓存会话信息，导致性能问题
2. **缺少登录缓存**：频繁查询用户数据

### 用户体验问题
1. **缺少客户端表单验证**：用户只有在提交时才知道错误
2. **缺少实时验证反馈**：没有实时格式检查
3. **使用window.location.href跳转**：破坏SPA体验

这些问题导致：
- 安全风险：容易被暴力破解、CSRF、XSS等攻击
- 性能问题：数据库压力大，响应慢
- 用户体验差：错误提示不及时，表单体验不佳

## What Changes

实现一套完整的登录安全增强方案，分为4个独立Block：

### Block 1: 登录失败锁定机制
- 创建 `apps/api/src/services/login-attempts.service.ts`
- 实现5次失败锁定15分钟的机制
- 支持IP和邮箱双重维度锁定
- 集成到登录流程

### Block 2: 增强Rate Limit机制
- 创建 `apps/api/src/middleware/user-rate-limit.middleware.ts`
- 实现基于用户ID的Rate Limit（优先级高于IP）
- 防止代理绕过
- 更新登录接口使用新的Rate Limit

### Block 3: CSRF防护
- 创建 `apps/api/src/middleware/csrf.middleware.ts`
- 生成和验证CSRF token
- 前端集成CSRF token发送
- 支持token过期机制（24小时）

### Block 4: XSS防护
- 安装并集成DOMPurify库
- 创建 `apps/web/src/utils/xss.ts`
- 对用户输入进行过滤
- 在显示用户内容时使用过滤函数

### Block 5: 会话固定防护
- 修改登录流程，登录后强制更换会话ID
- 清除旧会话
- 验证新会话有效性

### Block 6: Cookie安全增强
- 修改 `apps/api/src/config/cookies.ts`
- sameSite改为strict
- 添加domain配置
- 更新所有cookie设置使用统一配置

### Block 7: 密码强度增强
- 前端实现密码强度验证（8位+复杂度）
- 后端增强密码验证规则
- 提供实时密码强度反馈

### Block 8: 审计日志
- 创建 `apps/api/src/services/audit.service.ts`
- 记录登录/登出/失败等事件
- 包含IP、User-Agent、时间等信息
- 提供审计日志查询接口

### Block 9: 并发会话控制
- 创建 `apps/api/src/services/session-limit.service.ts`
- 限制同一用户最多5个活跃会话
- 超出限制时撤销最旧会话
- 提供会话管理接口

### Block 10: 会话缓存
- 创建 `apps/api/src/services/session-cache.service.ts`
- 使用NodeCache缓存会话信息
- TTL设置为5分钟
- 减少数据库查询

### Block 11: 客户端表单验证
- 创建 `apps/web/src/utils/validation.ts`
- 实现邮箱、密码验证函数
- 实时验证反馈
- 统一错误处理

### Block 12: 登录页面优化
- 使用ui-refactor skill重构登录页面
- 添加实时验证反馈
- 修复window.location.href跳转问题
- 使用React Router导航

## Impact

- 影响范围：
  - 后端：apps/api/src/services/, apps/api/src/middleware/, apps/api/src/controllers/, apps/api/src/config/
  - 前端：apps/web/src/pages/, apps/web/src/utils/, apps/web/src/lib/, apps/web/src/components/
  - 数据库：可能需要新增表（login_attempts, audit_logs）

- 风险等级：高（涉及核心认证流程，需要充分测试）

- 兼容性：向后兼容，渐进式迁移

- 依赖项：
  - NodeCache
  - DOMPurify
  - @types/dompurify

## Block 依赖关系

```
Block 1 (登录锁定) ──┬──> Block 2 (Rate Limit增强)
                        │
                        ├──> Block 3 (CSRF防护)
                        │
                        ├──> Block 4 (XSS防护)
                        │
                        ├──> Block 5 (会话固定防护)
                        │
                        ├──> Block 6 (Cookie安全)
                        │
                        ├──> Block 7 (密码强度)
                        │
                        ├──> Block 8 (审计日志)
                        │
                        ├──> Block 9 (并发会话)
                        │
                        └──> Block 10 (会话缓存)

Block 1-10 (后端安全) ──> Block 11 (前端验证) ──> Block 12 (页面优化)
```

## 验收标准

### 安全性
- [ ] 登录失败5次后自动锁定15分钟
- [ ] Rate Limit基于用户ID，防止代理绕过
- [ ] 所有POST请求验证CSRF token
- [ ] 用户输入经过XSS过滤
- [ ] 登录后强制更换会话ID
- [ ] Cookie使用sameSite: strict
- [ ] 密码要求至少8位，包含大小写字母、数字、特殊字符
- [ ] 所有登录事件记录审计日志
- [ ] 同一用户最多5个活跃会话

### 性能
- [ ] 会话信息缓存命中率 > 80%
- [ ] 登录接口P95响应时间 < 500ms
- [ ] 数据库查询减少50%以上

### 用户体验
- [ ] 表单实时验证反馈
- [ ] 密码强度实时显示
- [ ] 错误提示清晰准确
- [ ] 登录成功后使用React Router导航
- [ ] 页面符合UI设计规范

### 测试
- [ ] 单元测试覆盖率 > 80%
- [ ] 集成测试通过
- [ ] 安全测试通过（暴力破解、CSRF、XSS）
- [ ] 性能测试通过

### 文档
- [ ] 代码注释完整
- [ ] 更新AGENTS.md中的安全规范
- [ ] 提供部署指南
