# Design: 前后端命名格式自动转换方案

## Context

### 背景
本项目前后端采用不同的命名规范：
- **前端**：TypeScript/JavaScript 标准，使用 camelCase
- **数据库**：Prisma ORM，使用 snake_case
- **控制器**：混合使用两种格式，导致大量手动转换代码

### 约束条件
1. 需要保持向后兼容，不能破坏现有功能
2. 转换必须是自动的，对开发者透明
3. 需要处理复杂的嵌套对象和数组
4. 性能影响应最小化
5. 需要支持渐进式迁移

### 目标
- 消除手动字段映射代码
- 统一 API 命名规范
- 提升代码可维护性
- 改善开发者体验

---

## Goals / Non-Goals

### Goals（目标）
1. 实现请求体自动 camelCase → snake_case 转换
2. 实现响应数据自动 snake_case → camelCase 转换
3. 支持嵌套对象和数组的递归转换
4. 提供可配置的转换规则（可跳过特定字段/路由）
5. 确保性能影响最小化

### Non-Goals（非目标）
1. 不修改现有数据库 schema
2. 不改变 API 的 URL 路径命名
3. 不强制前端修改现有代码（除非类型定义）
4. 不处理文件上传（二进制数据）

---

## Decisions

### 决策 1: 转换位置

**选择**：Express 中间件层

**原因**：
- 集中化管理，代码侵入性最小
- 对业务逻辑透明，开发者无感知
- 易于测试和维护

**备选方案**：
- 方案 A（已否决）：在每个控制器中手动转换 → 代码重复，难以维护
- 方案 B（已否决）：在前端统一转换 → 需要修改大量前端代码
- 方案 C（已否决）：使用 OpenAPI/Swagger 自动生成转换代码 → 引入过多复杂度

---

### 决策 2: 转换库选择

**选择**：自建轻量转换函数

**原因**：
- 项目依赖已经很多，减少外部依赖
- 只需要简单的 camelCase/snake_case 转换
- 易于定制和扩展

**备选方案**：
- 方案 A：使用 `snake-case` + `camel-case` npm 包 → 引入新依赖
- 方案 B：使用 `humps` 库 → 功能过多，性能开销大

---

### 决策 3: 响应转换时机

**选择**：重写 `res.json` 方法

**原因**：
- 可以捕获所有 JSON 响应
- 与现有 `responseMiddleware` 兼容
- 实现简单

**备选方案**：
- 方案 A：在每个控制器中手动转换 → 重复代码
- 方案 B：创建包装函数 → 侵入性大

---

### 决策 4: 数组处理策略

**选择**：递归转换数组元素

**原因**：
- 符合直觉，数组元素也需要转换
- 避免特殊处理逻辑

**备选方案**：
- 方案 A：只转换对象，不处理数组 → 会导致数组内对象字段未转换
- 方案 B：提供配置选项 → 增加复杂度

---

## Implementation Details

### 转换函数核心逻辑

```typescript
// 基础转换函数
const toSnake = (str: string): string =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const toCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

// 递归转换对象
function transformKeysToSnake<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(item => transformKeysToSnake(item));
  if (typeof obj !== 'object') return obj;
  
  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key];
    const snakeKey = toSnake(key);
    result[snakeKey] = transformKeysToSnake(value);
    return result;
  }, {} as any);
}
```

### 中间件结构

```typescript
// 请求转换中间件
export const requestCaseTransform = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body && typeof req.body === 'object') {
    req.body = transformKeysToSnake(req.body);
  }
  next();
};

// 响应转换中间件
export const responseCaseTransform = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    if (body && typeof body === 'object' && !body.isStream) {
      return originalJson(transformKeysToCamel(body));
    }
    return originalJson(body);
  };
  next();
};
```

---

## Risks / Trade-offs

### 风险 1: 性能影响
- **风险**：每次请求/响应都进行递归转换
- **影响**：对大对象可能造成性能瓶颈
- **缓解**：
  - 只在开发环境启用详细日志
  - 对超过阈值的大对象使用流式处理
  - 添加性能基准测试

### 风险 2: 循环引用
- **风险**：对象中存在循环引用时会导致栈溢出
- **影响**：服务崩溃
- **缓解**：
  - 使用 WeakMap 追踪已访问对象
  - 添加循环引用检测
  - 单元测试覆盖边界情况

### 风险 3: 第三方库集成
- **风险**：某些第三方库返回的数据结构特殊
- **影响**：转换可能破坏数据结构
- **缓解**：
  - 白名单机制，跳过特定路由
  - 错误边界处理
  - 充分的测试覆盖

### 风险 4: 遗留代码兼容性
- **风险**：部分现有代码依赖特定字段格式
- **影响**：功能异常
- **缓解**：
  - 渐进式迁移，先在新代码中使用
  - 添加配置开关控制是否启用转换
  - 保留手动转换的备用方案

---

## Migration Plan

### 阶段 1: 基础设施（Block 1-4）
1. 实现转换工具函数
2. 实现中间件
3. 集成到 Express 应用
4. 添加开关，默认关闭

### 阶段 2: 清理（Block 5）
1. 开启转换中间件（兼容模式）
2. 清理控制器中的手动映射
3. 验证功能正常
4. 关闭兼容模式

### 阶段 3: 优化（Block 6-7）
1. 更新前端类型定义
2. 完善单元测试
3. 更新代码规范
4. 移除开关，默认开启

---

## Open Questions

1. **是否需要支持部分字段不转换？**
   - 例如：保留 `providerId` 原样传递
   - 建议：暂不支持，通过路由白名单跳过

2. **如何处理文件上传场景？**
   - 文件上传的 multipart/form-data 不需要转换
   - 建议：中间件检测 Content-Type，跳过非 JSON 请求

3. **是否需要支持 GraphQL？**
   - 当前项目仅使用 REST API
   - 建议：暂不支持，后续需要再扩展

4. **性能基准是多少？**
   - 目标：单次转换 < 5ms（1KB 对象）
   - 建议：添加性能测试，持续监控
