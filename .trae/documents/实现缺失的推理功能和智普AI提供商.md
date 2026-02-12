## 实施计划

### 任务1: 剧本结构化解析服务 (P1)
**文件**: `apps/api/src/services/script/script-parser.service.ts` (新建)
- 创建完整的剧本解析服务
- 使用AI推理理解剧本结构（场景、角色、对话、动作）
- 支持多种剧本格式（标准剧本、小说文本等）
- 返回结构化数据（场景列表、角色列表、对话列表）

### 任务2: 推理结果缓存服务 (P1)
**文件**: `apps/api/src/services/cache/cache.service.ts` (新建)
- 使用Redis存储AI推理结果
- 按请求哈希缓存（prompt + model + params）
- 设置合理的TTL（如1小时）
- 提供缓存命中/未命中统计

### 任务3: 批量推理任务队列 (P2)
**文件**: `apps/api/src/services/queue/inference-queue.service.ts` (新建)
- 使用Bull队列处理批量推理任务
- 支持并发控制和重试机制
- 提供任务状态查询接口
- 集成到Director Agent和图像生成

### 任务4: 推理质量评分服务 (P2)
**文件**: `apps/api/src/services/quality/quality-scoring.service.ts` (新建)
- 对AI生成的文本评分（相关性、连贯性、完整性）
- 对AI生成的图像评分（清晰度、构图、风格一致性）
- 提供评分历史记录
- 集成到生成流程中

### 任务5: 智普AI提供商 (P1)
**文件**: `apps/api/src/services/ai/zhipu.provider.ts` (新建)
- 实现智普AI接口（chat、图像生成）
- 遵循AIProvider抽象接口
- 支持智谱GLM模型系列
**修改文件**:
- `apps/api/src/types/ai.types.ts` - 添加'zhipu'类型
- `apps/api/src/services/ai/provider.service.ts` - 注册智普AI

### 任务6: 集成更新
**修改文件**:
- `apps/api/src/agents/director.agent.ts` - 使用缓存服务
- `apps/api/src/controllers/shot-generation.controller.ts` - 使用任务队列
- `apps/api/src/controllers/script.controller.ts` - 使用剧本解析服务