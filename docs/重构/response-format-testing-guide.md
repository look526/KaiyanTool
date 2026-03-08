# 响应格式统一测试指南

## 测试端点

服务器运行后，可以通过以下端点测试响应格式统一：

### 测试端点

```bash
# 1. 测试旧格式的错误响应（res.status().json()）
curl http://localhost:3000/api/test/legacy-error

# 预期响应：
{
  "success": false,
  "error": {
    "code": "LEGACY_ERROR",
    "message": "这是旧格式的错误"
  }
}

# 2. 测试旧格式的成功响应（res.json()）
curl http://localhost:3000/api/test/legacy-success

# 预期响应：
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "test"
    }
  }
}

# 3. 测试新格式的错误响应（res.status().json()）
curl http://localhost:3000/api/test/new-error

# 预期响应：
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "这是新格式的错误"
  }
}

# 4. 测试新格式的成功响应（res.json()）
curl http://localhost:3000/api/test/new-success

# 预期响应：
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "test"
    }
  }
}

# 5. 测试BaseController的响应
curl http://localhost:3000/api/test/base-controller

# 预期响应：
{
  "success": true,
  "data": {
    "message": "使用BaseController"
  }
}
```

## 验证现有端点

### 项目端点

```bash
# 测试项目创建（旧格式错误）
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{}'

# 预期响应（旧格式自动转换）：
{
  "success": false,
  "error": {
    "code": "LEGACY_ERROR",
    "message": "项目名称是必填项"
  }
}

# 测试项目列表（旧格式成功）
curl http://localhost:3000/api/projects

# 预期响应（旧格式自动转换）：
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {...}
  }
}
```

### 认证端点

```bash
# 测试登录（旧格式错误）
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123"}'

# 预期响应（旧格式自动转换）：
{
  "success": false,
  "error": {
    "code": "LEGACY_ERROR",
    "message": "邮箱或密码错误"
  }
}
```

## 中间件日志

服务器控制台会显示以下日志：

```
[LegacyResponseMiddleware] Converting legacy error format: 这是旧格式的错误
[LegacyResponseMiddleware] Normalized response: {"success":false,"error":{"code":"LEGACY_ERROR","message":"这是旧格式的错误"}}

[LegacyResponseMiddleware] Wrapping data in success format
[LegacyResponseMiddleware] Normalized response: {"success":true,"data":{"user":{"id":1,"name":"test"}}}
```

## 响应格式规范

### 标准成功响应

```json
{
  "success": true,
  "data": {
    // 实际数据
  },
  "meta": {
    // 可选的元数据（分页等）
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### 标准错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {
      // 可选的错误详情
    }
  }
}
```

### 旧格式自动转换

```typescript
// 旧格式（自动转换）
{ error: '错误消息' }

// 转换为
{
  success: false,
  error: {
    code: 'LEGACY_ERROR',
    message: '错误消息'
  }
}

// 旧格式（自动转换）
{ user: { id: 1, name: 'test' } }

// 转换为
{
  success: true,
  data: {
    user: { id: 1, name: 'test' }
  }
}
```

## 验证清单

- [ ] 所有旧格式 `{ error: 'xxx' }` 都转换为 `{ success: false, error: { code: 'LEGACY_ERROR', message: 'xxx' } }`
- [ ] 所有旧格式数据都转换为 `{ success: true, data: {...} }`
- [ ] 新格式响应保持不变
- [ ] BaseController 响应正常工作
- [ ] 中间件日志正确显示转换过程
- [ ] 所有现有端点都经过中间件处理

## 故障排查

### 如果旧格式没有转换

1. 检查中间件是否正确应用
   ```bash
   # 查看 index.ts 中是否有
   app.use(legacyResponseMiddleware)
   ```

2. 检查中间件顺序
   ```bash
   # 确保中间件在所有路由之前
   app.use(legacyResponseMiddleware)
   app.use('/api/auth', authRoutes)
   ```

3. 查看服务器日志
   ```bash
   # 查找转换日志
   [LegacyResponseMiddleware] Converting legacy error format
   [LegacyResponseMiddleware] Wrapping data in success format
   ```

### 如果响应格式不一致

1. 检查控制器代码
   ```typescript
   // 确保使用正确的响应方法
   res.json({ error: 'xxx' })  // 旧格式，会被转换
   res.json({ success: false, error: {...} })  // 新格式，保持不变
   ```

2. 检查中间件逻辑
   ```typescript
   // 查看 legacy-response.middleware.ts 中的 normalizeResponse 函数
   ```

## 下一步

1. **验证所有测试端点**
   - 运行所有测试端点
   - 确认响应格式正确
   - 检查中间件日志

2. **测试现有端点**
   - 测试项目端点
   - 测试认证端点
   - 确认旧格式被正确转换

3. **逐步迁移控制器**
   - 使用新控制器替换旧控制器
   - 使用 BaseController
   - 使用标准化响应方法

4. **移除测试路由**
   - 验证完成后移除测试路由
   - 移除测试控制器
   - 移除中间件日志