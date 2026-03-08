# Tasks: 前后端命名格式自动转换实现

## 实施计划（7个独立Block）

### Block 1: 转换工具函数库
- [x] 1.1 创建 `apps/api/src/utils/case-transform.ts`
- [x] 1.2 实现 `toSnakeCase(str: string): string` 函数
- [x] 1.3 实现 `toCamelCase(str: string): string` 函数
- [x] 1.4 实现 `transformKeysToSnake<T>(obj: T): any` 递归转换函数
- [x] 1.5 实现 `transformKeysToCamel<T>(obj: T): any` 递归转换函数
- [x] 1.6 添加单元测试文件 `apps/api/src/tests/utils/case-transform.test.ts`
- [x] 1.7 验证转换函数处理嵌套对象、数组、null、undefined 等边界情况

### Block 2: 请求转换中间件
- [x] 2.1 创建 `apps/api/src/middleware/case-transform.middleware.ts`
- [x] 2.2 实现 `transformRequestBody` 函数
- [x] 2.3 实现 `transformQueryParams` 函数（可选）
- [x] 2.4 导出中间件函数 `requestCaseTransform`
- [x] 2.5 添加跳过特定路由的配置选项

### Block 3: 响应转换中间件
- [x] 3.1 创建 `apps/api/src/middleware/response-case-transform.middleware.ts`
- [x] 3.2 实现 `responseCaseTransform` 中间件
- [x] 3.3 重写 `res.json` 方法自动转换响应数据
- [x] 3.4 确保错误响应不被转换（保持原始格式）
- [x] 3.5 处理流式响应不被转换

### Block 4: 中间件集成
- [x] 4.1 读取 `apps/api/src/index.ts` 了解当前中间件加载顺序
- [x] 4.2 在请求处理前加载请求转换中间件
- [x] 4.3 在响应发送前加载响应转换中间件
- [x] 4.4 配置中间件优先级（body-parser 之后）
- [x] 4.5 添加环境变量控制是否启用转换（开发/生产）

### Block 5: 控制器清理
- [x] 5.1 清理 ai-provider.controller.ts 中的手动字段映射
  - [x] 5.1.1 移除 `apiKey` -> `api_key` 手动转换
  - [x] 5.1.2 移除 `baseUrl` -> `base_url` 手动转换
  - [x] 5.1.3 移除响应时的手动映射
- [x] 5.2 清理 asset.controller.ts 中的手动字段映射
  - [x] 5.2.1 移除 `referenceImages` -> `reference_images` 手动转换
  - [x] 5.2.2 移除其他手动字段映射
- [x] 5.3 检查并清理其他控制器中的类似问题
  - [x] 5.3.1 model-preference.controller.ts
  - [x] 5.3.2 其他受影响控制器
- [ ] 5.4 确保 Prisma 查询使用正确的 snake_case 字段名

### Block 6: 前端类型统一
- [ ] 6.1 检查前端 API 类型定义（apps/web/src/types/）
- [ ] 6.2 确保前端统一使用 camelCase 类型
- [ ] 6.3 更新 api-client.ts 如有需要
- [ ] 6.4 验证前端与后端转换兼容

### Block 7: 代码规范与测试
- [x] 7.1 在 AGENTS.md 中添加 API 命名规范
- [x] 7.2 创建完整的转换函数单元测试
- [x] 7.3 运行现有测试确保没有回归
- [x] 7.4 手动测试关键 API 端点
- [x] 7.5 更新相关文档（如果需要）

---

## 并行执行建议

以下 Block 可以并发处理（由不同 AI 同时执行）：

1. **Block 1** 和 **Block 2** 可以并行开发（但 Block 2 依赖 Block 1）
2. **Block 3** 可以与 Block 2 并行开发
3. **Block 5** 中的多个控制器清理任务可以并行
4. **Block 6** 和 **Block 7** 可以并行

---

## 依赖关系图

```
Block 1: 工具函数库
    │
    ├──> Block 2: 请求转换中间件
    │
    └──> Block 3: 响应转换中间件
              │
              └──> Block 4: 中间件集成
                        │
                        ├──> Block 5: 控制器清理
                        │         │
                        │         ├── ai-provider.controller.ts
                        │         ├── asset.controller.ts
                        │         └── 其他控制器
                        │
                        └──> Block 6: 前端类型统一
                                  │
                                  └──> Block 7: 代码规范与测试
```

---

## 验证步骤

每个 Block 完成后应执行以下验证：

1. 代码语法检查（TypeScript 编译）
2. 单元测试运行
3. 简单 API 调用测试
4. 检查是否引入新的 lint 错误
