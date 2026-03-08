# Change: 实现前后端命名格式自动转换

## Why
当前项目存在前后端命名格式不一致问题：
- 前端使用 camelCase 发送请求数据
- 后端数据库层使用 snake_case (Prisma)
- 控制器层混合使用两种格式，导致字段映射混乱
- 部分 API 返回数据命名格式不统一

这导致：
1. 开发者需要手动进行字段映射，容易出错
2. 代码可维护性差，新增字段时容易遗漏转换
3. 难以追踪数据流，调试困难

## What Changes
实现一套完整的、自动化的前后端命名格式转换机制，包含7个独立Block：

### Block 1: 转换工具函数库
- 创建 `apps/api/src/utils/case-transform.ts`
- 实现 `transformKeysToSnake()` 和 `transformKeysToCamel()` 函数
- 支持嵌套对象和数组转换

### Block 2: 请求转换中间件
- 创建 `apps/api/src/middleware/case-transform.middleware.ts`
- 自动将 `req.body` 中的 camelCase 转换为 snake_case
- 支持 Query 参数转换

### Block 3: 响应转换中间件
- 创建 `apps/api/src/middleware/response-case-transform.middleware.ts`
- 自动将响应数据中的 snake_case 转换为 camelCase
- 集成到现有响应中间件流程

### Block 4: 中间件集成
- 修改 `apps/api/src/index.ts` 加载新中间件
- 配置中间件顺序（先转换请求，再处理业务，最后转换响应）

### Block 5: 控制器清理
- 移除 ai-provider.controller.ts 中的手动字段映射
- 移除 asset.controller.ts 中的手动字段映射
- 简化控制器代码，依赖中间件完成转换

### Block 6: 前端类型统一
- 更新 `apps/web/src/types/` 中的类型定义
- 确保前端 API 调用统一使用 camelCase
- 添加单元测试验证转换准确性

### Block 7: 代码规范与文档
- 在 AGENTS.md 中添加 API 命名规范
- 创建转换工具的单元测试
- 验证所有 API 端点正常工作

## Impact
- 影响范围：
  - 后端：apps/api/src/utils/, apps/api/src/middleware/, apps/api/src/controllers/
  - 前端：apps/web/src/types/, apps/web/src/lib/
- 风险等级：中（需要全面测试确保不影响现有功能）
- 兼容性：渐进式迁移，支持双向兼容

## Block 依赖关系
```
Block 1 (工具函数) ──┬──> Block 2 (请求中间件)
                    │
                    └──> Block 3 (响应中间件)

Block 2 + Block 3 ──> Block 4 (中间件集成)

Block 4 ────────────> Block 5 (控制器清理) ──> Block 6 (前端适配) ──> Block 7 (规范文档)
```

## 验收标准
-工具函数覆盖所有 [ ] 转换嵌套场景
- [ ] 所有 API 请求自动完成命名转换
- [ ] 所有 API 响应自动完成命名转换
- [ ] 现有功能测试通过
- [ ] 单元测试覆盖转换逻辑
- [ ] 代码规范文档已更新
