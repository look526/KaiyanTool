# TypeScript 构建错误修复计划

## 错误分类与修复方案

### 1. AIProviderService 导入错误 (4个文件) 🔴 高优先级
**文件：**
- [outline-agent.ts](file:///d:/project/kaiyanTool/apps/api/src/agents/outline-agent.ts#L1)
- [script-analysis.agent.ts](file:///d:/project/kaiyanTool/apps/api/src/agents/script-analysis.agent.ts#L1)
- [storyboard-agent.ts](file:///d:/project/kaiyanTool/apps/api/src/agents/storyboard-agent.ts#L1)
- [storyline-agent.ts](file:///d:/project/kaiyanTool/apps/api/src/agents/storyline-agent.ts#L1)

**问题：** 导入 `AIProviderService` 类，但该类未被导出
**修复：** 修改导入语句为使用导出的单例实例
```typescript
// 从
import { AIProviderService } from '../services/ai/provider.service';
// 改为
import { aiProviderService } from '../services/ai/provider.service';
```
同时修改构造函数，移除 `new AIProviderService()`，直接使用 `aiProviderService`

---

### 2. Logger 导入错误 🔴 高优先级
**文件：** [document.controller.ts](file:///d:/project/kaiyanTool/apps/api/src/controllers/document.controller.ts#L3)

**问题：** 使用命名导入 `{ logger }`，但只有默认导出
**修复：** 
```typescript
// 从
import { logger } from '../lib/logger';
// 改为
import logger from '../lib/logger';
```

---

### 3. Image 尺寸类型错误 (4处) 🟡 中优先级
**文件：** [shot-generation.controller.ts](file:///d:/project/kaiyanTool/apps/api/src/controllers/shot-generation.controller.ts) (行48, 111, 173, 179)

**问题：** 使用 `'1536x1024'` 和 `'1024x1792'`，但类型定义中不支持
**修复：** 扩展 [ai.types.ts](file:///d:/project/kaiyanTool/apps/api/src/types/ai.types.ts#L61) 中的类型定义
```typescript
size?: '256x256' | '512x512' | '1024x1024' | '1920x1080' | '1536x1024' | '1024x1792'
```

---

### 4. Sentry API 兼容性 🟡 中优先级
**文件：** [sentry.ts](file:///d:/project/kaiyanTool/apps/api/src/lib/sentry.ts)

**问题：** 可能需要检查 Sentry 版本兼容性
**修复：** 检查 `@sentry/profiling-node` 导入是否正确，根据实际版本调整

---

### 5. Prisma 类型导出 🟡 中优先级
**文件：** project-member.controller.ts, project.controller.ts

**问题：** MemberRole 和 ProjectType 类型未找到
**修复：** 运行 `npx prisma generate` 重新生成 Prisma 客户端

---

### 6. date-fns 依赖 🟢 低优先级
**文件：** [analytics.service.ts](file:///d:/project/kaiyanTool/apps/api/src/services/analytics.service.ts)

**问题：** date-fns 包未安装
**修复：** 安装依赖 `npm install date-fns`

---

## 修复步骤
1. 修复 AIProviderService 导入错误（4个文件）
2. 修复 Logger 导入错误
3. 扩展 Image 尺寸类型定义
4. 运行 `npx prisma generate`
5. 安装缺失的依赖
6. 运行 TypeScript 编译验证

## 预期结果
所有 TypeScript 编译错误将被修复，项目可以成功构建。