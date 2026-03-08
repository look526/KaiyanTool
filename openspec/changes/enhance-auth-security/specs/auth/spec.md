# Capability: Authentication Security

认证安全能力，提供安全的用户登录、会话管理和审计追踪功能。

## ADDED Requirements

### Requirement: AUTH-001 - 登录失败锁定机制

系统MUST在连续多次登录失败后锁定用户，防止暴力破解攻击。

#### Scenario: 用户连续5次登录失败后被锁定
Given 用户邮箱为test@example.com
And 该用户未被锁定
When 用户连续5次输入错误密码
Then 系统应该锁定该用户15分钟
And 第6次登录尝试应该返回"账户已被临时锁定"错误
And 错误信息应该包含解锁时间

#### Scenario: 用户登录成功后清除失败记录
Given 用户邮箱为test@example.com
And 该用户有3次失败记录
When 用户输入正确的密码登录
Then 系统应该清除失败记录
And 用户可以正常登录
And 失败计数器重置为0

#### Scenario: 锁定期过后自动解锁
Given 用户邮箱为test@example.com
And 该用户已被锁定
When 15分钟过去后
Then 系统应该自动解锁该用户
And 用户可以尝试登录
And 失败计数器重置为0

#### Scenario: 不同IP的登录失败独立计数
Given 用户邮箱为test@example.com
And 从IP 192.168.1.1有3次失败记录
When 从IP 192.168.1.2尝试登录失败
Then 失败计数器应该为1（不累加之前的3次）
And 两个IP的计数器相互独立

### Requirement: AUTH-002 - 基于用户的Rate Limit

系统MUST实现基于用户ID的请求频率限制，防止攻击者通过代理绕过限制。

#### Scenario: 同一用户的不同IP请求共享Rate Limit
Given 用户ID为user123
And 从IP 192.168.1.1已发送4次登录请求
When 从IP 192.168.1.2发送第5次登录请求
Then 系统应该拒绝该请求
And 返回"登录尝试过于频繁"错误
And Rate Limit基于用户ID而非IP

#### Scenario: 未登录用户使用IP作为Rate Limit key
Given 用户未登录
And IP为192.168.1.1
When 发送登录请求
Then Rate Limit应该使用IP作为key
And 15分钟内最多允许5次尝试

#### Scenario: 已登录用户使用用户ID作为Rate Limit key
Given 用户ID为user123
And 已登录
When 发送API请求
Then Rate Limit应该使用用户ID作为key
And 15分钟内最多允许100次请求

### Requirement: AUTH-003 - CSRF防护

系统MUST实现CSRF（跨站请求伪造）防护，保护用户免受CSRF攻击。

#### Scenario: GET请求生成CSRF token
Given 用户访问登录页面
When 浏览器发送GET请求
Then 系统应该生成CSRF token
And 通过响应头X-CSRF-Token返回token
And token存储在服务器内存中

#### Scenario: POST请求验证CSRF token
Given 用户已获取CSRF token
When 发送POST请求
Then 请求必须包含X-CSRF-Token头
And token必须与服务器存储的匹配
And 验证成功后处理请求

#### Scenario: 缺少CSRF token被拒绝
Given 用户已获取CSRF token
When 发送POST请求但未包含X-CSRF-Token头
Then 系统应该拒绝请求
And 返回403状态码
And 错误信息为"CSRF token无效或已过期"

#### Scenario: CSRF token过期
Given 用户已获取CSRF token
And 24小时过去
When 发送POST请求
Then 系统应该拒绝请求
And 返回403状态码
And 错误信息为"CSRF token已过期"

#### Scenario: CSRF token定期清理
Given 系统运行中
When 1小时过去
Then 系统应该清理所有过期的CSRF token
And 释放内存

### Requirement: AUTH-004 - XSS防护

系统MUST对所有用户输入进行XSS（跨站脚本）过滤，防止XSS攻击。

#### Scenario: 用户输入HTML标签被过滤
Given 用户在评论框输入`<script>alert('xss')</script>`
When 提交表单
Then 系统应该过滤script标签
And 存储的评论不包含script标签
And 显示时不会执行脚本

#### Scenario: 用户输入特殊字符被转义
Given 用户在昵称输入框输入`<img src=x onerror=alert(1)>`
When 提交表单
Then 系统应该转义特殊字符
And 存储的昵称为安全的文本
And 显示时不会执行脚本

#### Scenario: 允许的安全HTML标签被保留
Given 用户输入`<strong>重要</strong>`
When 提交表单
Then 系统应该保留strong标签
And 显示时正确渲染加粗文本

#### Scenario: 登录表单输入被过滤
Given 用户在登录表单输入包含XSS的密码
When 提交登录
Then 系统应该过滤XSS payload
And 不影响密码验证逻辑

### Requirement: AUTH-005 - 会话固定防护

系统MUST在登录后强制更换会话ID，防止会话固定攻击。

#### Scenario: 登录后更换会话ID
Given 用户访问登录页时有一个临时会话ID
When 用户成功登录
Then 系统应该删除旧会话ID
And 生成新的会话ID
And 设置新的cookie
And 旧会话ID失效

#### Scenario: 登录成功后清除旧cookie
Given 用户登录前有sessionId cookie
When 用户成功登录
Then 系统应该清除旧cookie
And 设置新的sessionId cookie
And 新cookie值与旧值不同

#### Scenario: 登录失败不更换会话ID
Given 用户有一个临时会话ID
When 用户登录失败
Then 系统不应该更换会话ID
And 临时会话ID保持不变
And 用户可以重试登录

### Requirement: AUTH-006 - Cookie安全配置

系统MUST使用安全的Cookie配置，防止Cookie劫持和CSRF攻击。

#### Scenario: Cookie使用httpOnly属性
Given 系统设置sessionId cookie
Then cookie应该设置httpOnly=true
And JavaScript无法访问cookie
And 防止XSS窃取cookie

#### Scenario: 生产环境Cookie使用secure属性
Given NODE_ENV=production
When 系统设置cookie
Then cookie应该设置secure=true
And cookie只通过HTTPS传输
And 防止中间人攻击

#### Scenario: Cookie使用sameSite=strict
Given 系统设置cookie
Then cookie应该设置sameSite=strict
And cookie不随跨站请求发送
And 防止CSRF攻击

#### Scenario: Cookie设置过期时间
Given 用户选择"记住我"
When 系统设置cookie
Then cookie应该设置maxAge=30天
And 用户30天内无需重新登录

### Requirement: AUTH-007 - 密码强度验证

系统MUST要求用户使用强密码，并实时提供密码强度反馈。

#### Scenario: 密码长度不足被拒绝
Given 用户输入密码为"Pass1"
When 提交注册表单
Then 系统应该拒绝密码
And 返回"密码至少8位"错误
And 密码强度显示为"弱"

#### Scenario: 密码缺少复杂度被拒绝
Given 用户输入密码为"password123"
When 提交注册表单
Then 系统应该拒绝密码
And 返回"密码必须包含大写字母、小写字母、数字和特殊字符"错误
And 密码强度显示为"中"

#### Scenario: 强密码被接受
Given 用户输入密码为"P@ssw0rd!2024"
When 提交注册表单
Then 系统应该接受密码
And 密码强度显示为"强"
And 密码符合所有要求

#### Scenario: 实时显示密码强度
Given 用户在注册页面输入密码
When 每输入一个字符
Then 系统应该实时计算密码强度
And 显示强度指示器（弱/中/强）
And 显示缺少的要求提示

### Requirement: AUTH-008 - 审计日志

系统MUST记录所有认证相关事件，包括登录、登出、失败等。

#### Scenario: 记录成功登录事件
Given 用户test@example.com成功登录
When 登录完成
Then 系统应该记录审计日志
And 包含以下信息：
  - userId: 用户ID
  - action: "LOGIN"
  - ip: 请求IP
  - userAgent: 浏览器信息
  - success: true
  - timestamp: 当前时间
  - details: { rememberMe: true }

#### Scenario: 记录失败登录事件
Given 用户test@example.com登录失败
When 登录失败
Then 系统应该记录审计日志
And 包含以下信息：
  - userId: "unknown"
  - action: "LOGIN_FAILED"
  - ip: 请求IP
  - userAgent: 浏览器信息
  - success: false
  - details: { email: "test@example.com", error: "密码错误" }

#### Scenario: 记录登出事件
Given 用户test@example.com登出
When 登出完成
Then 系统应该记录审计日志
And action为"LOGOUT"
And success为true

#### Scenario: 管理员查询审计日志
Given 管理员登录
When 请求GET /api/audit/logs?userId=user123
Then 系统应该返回该用户的所有审计日志
And 按时间倒序排列
And 限制返回100条记录

### Requirement: AUTH-009 - 并发会话控制

系统MUST限制同一用户的并发会话数量，防止会话滥用。

#### Scenario: 用户最多有5个活跃会话
Given 用户ID为user123
And 该用户已有5个活跃会话
When 用户尝试创建第6个会话（新设备登录）
Then 系统应该撤销最旧的会话
And 创建新会话
And 活跃会话数仍为5

#### Scenario: 用户查询活跃会话
Given 用户ID为user123
And 该用户有3个活跃会话
When 请求GET /api/auth/sessions
Then 系统应该返回3个会话信息
And 包含每个会话的：
  - id
  - createdAt
  - expiresAt
  - userAgent
  - ip

#### Scenario: 用户撤销指定会话
Given 用户ID为user123
And 该用户有3个活跃会话
When 请求DELETE /api/auth/sessions/session456
Then 系统应该撤销session456
And 其他2个会话保持活跃
And 返回成功响应

#### Scenario: 用户撤销所有会话
Given 用户ID为user123
And 该用户有5个活跃会话
When 请求DELETE /api/auth/sessions/all
Then 系统应该撤销所有5个会话
And 用户需要重新登录
And 返回成功响应

### Requirement: AUTH-010 - 会话缓存

系统MUST缓存会话信息，减少数据库查询，提高性能。

#### Scenario: 首次查询会话时从数据库获取
Given 用户首次请求受保护资源
When 系统验证会话
Then 应该从数据库查询会话信息
And 将会话信息存入缓存
And TTL为5分钟

#### Scenario: 缓存命中时直接返回
Given 会话信息已在缓存中
And TTL未过期
When 用户再次请求受保护资源
Then 应该从缓存获取会话信息
And 不查询数据库
And 响应时间 < 100ms

#### Scenario: 缓存过期时重新查询数据库
Given 会话信息在缓存中
And TTL已过期
When 用户请求受保护资源
Then 应该从数据库重新查询会话信息
And 更新缓存
And 重置TTL

#### Scenario: 登出时清除缓存
Given 用户登出
When 清除数据库会话
Then 应该同时清除缓存
And 下次查询必须从数据库获取

#### Scenario: 缓存命中率 > 80%
Given 系统运行1小时
When 统计缓存性能
Then 缓存命中率应该 > 80%
And 数据库查询减少50%以上

### Requirement: AUTH-011 - 客户端表单验证

系统MUST在客户端提供实时表单验证，提升用户体验。

#### Scenario: 邮箱格式实时验证
Given 用户在邮箱输入框输入"invalid-email"
When 输入框失去焦点
Then 系统应该显示"邮箱格式不正确"错误
And 输入框显示红色边框

#### Scenario: 邮箱格式正确通过验证
Given 用户在邮箱输入框输入"test@example.com"
When 输入框失去焦点
Then 系统应该不显示错误
And 输入框显示正常边框

#### Scenario: 密码强度实时显示
Given 用户在密码输入框输入密码
When 每输入一个字符
Then 系统应该实时计算密码强度
And 显示强度指示器：
  - 0-2分：弱（红色）
  - 3分：中（黄色）
  - 4-5分：强（绿色）

#### Scenario: 表单提交前完整验证
Given 用户填写登录表单
And 邮箱格式正确
And 密码不足8位
When 点击登录按钮
Then 系统应该阻止表单提交
And 显示所有错误信息
And 高亮错误字段

#### Scenario: 所有验证通过允许提交
Given 用户填写登录表单
And 邮箱格式正确
And 密码强度合格
When 点击登录按钮
Then 系统应该允许表单提交
And 发送登录请求
And 显示加载状态

### Requirement: AUTH-012 - 登录页面优化

系统MUST提供现代化、响应式的登录页面，符合Glassmorphism设计规范。

#### Scenario: 登录页面使用Glassmorphism设计
Given 用户访问登录页面
Then 页面应该包含：
  - 毛玻璃效果背景
  - 垂直渐变背景
  - 装饰性光晕
  - 统一的强调色（#8b5cf6）

#### Scenario: 登录页面使用可复用组件
Given 开发者实现登录页面
Then 应该使用以下可复用组件：
  - GlassButton
  - GlassInput
  - GlassCard
  - PageHeader

#### Scenario: 登录页面响应式设计
Given 用户在不同设备访问登录页面
Then 页面应该适配：
  - 桌面端（> 1024px）
  - 平板端（768px - 1024px）
  - 移动端（< 768px）

#### Scenario: 登录成功后使用React Router导航
Given 用户成功登录
Then 系统应该使用React Router的navigate
And 导航到/projects页面
And 不使用window.location.href
And 可以传递状态

#### Scenario: 显示清晰的错误提示
Given 用户登录失败
Then 系统应该显示错误提示
And 使用Toast组件
And 显示具体错误信息
And 包含错误图标
And 5秒后自动消失

#### Scenario: 显示加载状态
Given 用户点击登录按钮
Then 系统应该：
  - 显示加载spinner
  - 禁用登录按钮
  - 显示"登录中..."文本
  - 防止重复提交

## MODIFIED Requirements

### Requirement: AUTH-013 - 登录接口增强

登录接口MUST集成所有新的安全功能。

#### Scenario: 登录前检查锁定状态
Given 用户test@example.com已被锁定
When 请求POST /api/auth/login
Then 系统应该返回401状态码
And 错误信息为"账户已被临时锁定"
And 包含解锁时间
And 不进行密码验证

#### Scenario: 登录前记录尝试
Given 用户test@example.com未被锁定
When 请求POST /api/auth/login
Then 系统应该先记录登录尝试
And 检查是否超过限制
And 超过限制则锁定

#### Scenario: 登录成功后创建新会话
Given 用户test@example.com登录成功
When 密码验证通过
Then 系统应该：
  - 删除旧会话（如果存在）
  - 创建新会话
  - 检查会话限制
  - 必要时撤销最旧会话
  - 记录审计日志
  - 清除登录尝试记录
  - 缓存会话信息

#### Scenario: 登录失败返回统一错误
Given 用户test@example.com登录失败
Then 系统应该返回401状态码
And 错误信息为"邮箱或密码错误"
And 不泄露具体错误原因
And 记录审计日志

### Requirement: AUTH-014 - 认证中间件增强

认证中间件MUST使用会话缓存优化性能。

#### Scenario: 首次验证查询数据库
Given 用户首次请求受保护资源
When authMiddleware执行
Then 应该：
  - 从cookie获取sessionId
  - 从数据库查询会话
  - 验证会话有效性
  - 将会话存入缓存

#### Scenario: 后续验证使用缓存
Given 会话已在缓存中
When 用户再次请求受保护资源
Then authMiddleware应该：
  - 从cookie获取sessionId
  - 从缓存获取会话
  - 验证会话有效性
  - 不查询数据库

#### Scenario: 会话过期清除缓存
Given 会话已过期
When authMiddleware执行
Then 应该：
  - 从数据库查询会话
  - 发现会话过期
  - 清除缓存
  - 清除cookie
  - 返回401错误

### Requirement: AUTH-015 - 前端API客户端增强

前端API客户端MUST集成CSRF token。

#### Scenario: 自动获取CSRF token
Given 前端发送第一个请求
Then API客户端应该：
  - 检查是否有缓存的CSRF token
  - 如果没有，发送GET请求获取
  - 缓存token避免重复请求

#### Scenario: 请求包含CSRF token
Given 前端发送POST请求
Then API客户端应该：
  - 获取CSRF token
  - 在请求头添加X-CSRF-Token
  - 发送请求

#### Scenario: CSRF token失效时重新获取
Given 前端发送请求时token已过期
Then 系统应该返回403错误
And API客户端应该：
  - 清除缓存的token
  - 重新获取新token
  - 重试请求

#### Scenario: GET请求不包含CSRF token
Given 前端发送GET请求
Then API客户端应该：
  - 不添加X-CSRF-Token头
  - 但响应会包含新的token

## REMOVED Requirements

### Requirement: AUTH-OLD-001 - 简单密码验证

原有的6位最小密码长度要求已被移除，替换为更严格的强度验证。

#### Scenario: 6位密码不再被接受
Given 用户输入6位密码
When 提交注册表单
Then 系统应该拒绝密码
And 返回"密码至少8位"错误
And 不再接受6位密码

### Requirement: AUTH-OLD-002 - IP-based Rate Limit

原有的基于IP的Rate Limit已被替换为基于用户的Rate Limit。

#### Scenario: Rate Limit不再仅基于IP
Given 用户使用代理IP
When 发送多个请求
Then Rate Limit应该基于用户ID
And 不同IP但同一用户共享限制
And 代理无法绕过限制
