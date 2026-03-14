# CSRF 安全规则

## 1. CORS 配置规则

### 必须暴露的响应头
任何涉及 CSRF token 的 API 必须在 CORS 配置中暴露以下响应头：

```typescript
app.use(cors({
  origin: [...],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token']  // 必须包含！
}))
```

**检查清单：**
- [ ] CORS 配置中包含 `exposedHeaders: ['X-CSRF-Token']`
- [ ] 修改 CORS 配置后测试前端是否能读取响应头

## 2. CSRF 中间件范围规则

### 路径白名单机制
CSRF 中间件必须使用白名单机制，只处理需要保护的路径：

```typescript
// 需要CSRF保护的路径前缀
const csrfProtectedPaths = ['/api/auth', '/api/projects', '/api/upload', '/api/ai-providers'];

export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 检查路径是否需要CSRF保护
  const needsCsrfProtection = csrfProtectedPaths.some(path => req.path.startsWith(path));
  
  // 如果路径不需要CSRF保护，直接通过
  if (!needsCsrfProtection) {
    return next();
  }
  
  // ... CSRF 验证逻辑
}
```

**禁止事项：**
- ❌ 对所有路径进行 CSRF 验证
- ❌ 在 CSRF 中间件中处理健康检查、静态资源等路径

**检查清单：**
- [ ] 只有需要保护的路径才经过 CSRF 中间件
- [ ] 健康检查端点 (`/api/health`) 不在 CSRF 保护范围内

## 3. 前端 Token 管理规则

### 防止并发请求
获取 CSRF token 的函数必须防止并发请求：

```typescript
// 用于防止并发请求的全局变量
let csrfTokenPromise: Promise<string> | null = null;

export async function getCsrfToken(): Promise<string> {
  // 首先检查 localStorage 中是否已有 token
  const existingToken = localStorage.getItem('csrfToken');
  if (existingToken) {
    return existingToken;
  }
  
  // 如果已经有正在进行的请求，返回该 Promise
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }
  
  // 创建新的请求 Promise
  csrfTokenPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      const newToken = response.headers.get('X-CSRF-Token') || '';
      if (newToken) {
        localStorage.setItem('csrfToken', newToken);
      }
      return newToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return '';
    } finally {
      csrfTokenPromise = null;
    }
  })();
  
  return csrfTokenPromise;
}
```

**检查清单：**
- [ ] 使用全局 Promise 变量防止并发请求
- [ ] 优先使用 localStorage 中的现有 token
- [ ] 请求完成后清除 Promise 变量

## 4. 修改验证流程

### 任何涉及以下内容的修改必须经过验证：

1. **CORS 配置修改**
   - 修改后必须测试前端是否能正常读取 CSRF token
   - 测试命令：
     ```javascript
     // 浏览器控制台
     fetch('/api/auth/me', { credentials: 'include' })
       .then(r => console.log('CSRF Token:', r.headers.get('X-CSRF-Token')))
     ```

2. **CSRF 中间件修改**
   - 修改后必须测试登录流程
   - 测试步骤：
     1. 清除 localStorage
     2. 刷新页面
     3. 尝试登录
     4. 验证登录成功

3. **认证相关 API 修改**
   - 修改后必须测试完整认证流程
   - 包括：注册、登录、登出、获取当前用户

## 5. 测试用例模板

### 必须通过的测试用例

```typescript
// 测试 1: CSRF token 可以正常获取
describe('CSRF Token', () => {
  it('should return CSRF token in response headers', async () => {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    const token = response.headers.get('X-CSRF-Token');
    expect(token).toBeTruthy();
  });
  
  it('should validate CSRF token on protected endpoints', async () => {
    // 不带 token 请求应该失败
    const responseWithoutToken = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });
    expect(responseWithoutToken.status).toBe(403);
    
    // 带正确 token 请求应该成功（或返回 401 表示认证失败而非 CSRF 失败）
    const csrfResponse = await fetch('/api/auth/me', { credentials: 'include' });
    const token = csrfResponse.headers.get('X-CSRF-Token');
    
    const responseWithToken = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });
    expect(responseWithToken.status).not.toBe(403);
  });
});
```

## 6. 代码审查检查点

### 审查时必须检查：

- [ ] CORS 配置是否包含 `exposedHeaders: ['X-CSRF-Token']`
- [ ] CSRF 中间件是否使用白名单机制
- [ ] 前端 `getCsrfToken()` 是否防止并发请求
- [ ] 新增的路径是否正确分类（保护/不保护）
- [ ] 认证流程测试是否通过

## 7. 文档更新要求

任何涉及以下内容的修改必须更新本文档：
- CORS 配置变更
- CSRF 中间件逻辑变更
- 新增需要 CSRF 保护的路径
- 前端 token 管理逻辑变更
