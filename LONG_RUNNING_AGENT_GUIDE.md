# Long Running Agent System - 使用指南

## 概述

本系统实现了 Anthropic 文章中描述的长运行代理架构，用于处理需要跨越多个上下文窗口的复杂任务。

## 架构组件

### 1. Progress Tracking Service (`progress-tracking.service.ts`)

管理项目进度和会话记录，类似文章中的 `claude-progress.txt`。

**主要功能：**
- 初始化项目进度跟踪
- 记录每个会话的详细信息
- 更新功能状态（failing → in_progress → passing）
- 生成进度报告
- 管理会话历史

**核心方法：**
```typescript
await progressTrackingService.initializeProgress(projectId, taskDescription, features);
await progressTrackingService.recordSession(projectId, sessionRecord);
await progressTrackingService.updateFeatureStatus(projectId, featureId, status, notes);
```

### 2. Feature List Service (`feature-list.service.ts`)

使用 AI 生成和管理功能列表。

**主要功能：**
- 从任务描述生成详细功能列表
- 根据反馈优化功能列表
- 评估功能复杂度
- 按类别分组功能
- 验证功能完整性

**核心方法：**
```typescript
const features = await featureListService.generateFeatureList({
  taskDescription: 'Build a web application',
  projectContext: '...',
  technologies: ['React', 'Node.js'],
  constraints: ['Must use TypeScript'],
  providerId: 'provider-id',
});
```

### 3. Initializer Agent (`initializer.agent.ts`)

首次运行时设置项目环境的代理。

**主要功能：**
- 生成全面的功能列表
- 初始化进度跟踪系统
- 创建初始 git commit（可选）
- 生成下一步指南

**使用方式：**
```typescript
const result = await initializerAgent.initializeProject({
  project_id: 'project-123',
  task_description: 'Build a task management application',
  project_context: '...',
  technologies: ['React', 'Node.js', 'PostgreSQL'],
  provider_id: 'provider-id',
  create_git_commit: true,
});
```

### 4. Coding Agent (`coding.agent.ts`)

在每个后续会话中实现增量进展的代理。

**主要功能：**
- 选择 1-3 个功能实现
- 检查依赖关系
- 实现功能并测试
- 更新功能状态
- 记录会话详情

**使用方式：**
```typescript
const result = await codingAgent.runCodingSession({
  project_id: 'project-123',
  task_id: 'task-456',
  user_id: 'user-789',
  provider_id: 'provider-id',
  max_features: 2,
  session_notes: 'Focus on authentication features',
});
```

### 5. Long Running Orchestrator (`long-running-orchestrator.ts`)

协调整个长运行代理流程。

**主要功能：**
- 初始化项目
- 运行编码会话
- 获取项目状态
- 运行自动会话
- 导出进度报告

**使用方式：**
```typescript
const orchestrator = await createLongRunningOrchestrator({
  project_id: 'project-123',
  user_id: 'user-789',
  provider_id: 'provider-id',
  create_git_commits: true,
});

await orchestrator.startNewProject({
  task_description: 'Build a task management app',
});

await orchestrator.runCodingSession({
  max_features: 2,
});
```

## API 端点

### 初始化项目

```http
POST /api/v1/long-running-agent/projects/:project_id/users/:user_id/initialize
Content-Type: application/json

{
  "task_description": "Build a task management application",
  "project_context": "A web app for managing daily tasks",
  "technologies": ["React", "Node.js", "PostgreSQL"],
  "constraints": ["Must use TypeScript"],
  "existing_features": [],
  "provider_id": "provider-id",
  "workspace_path": "/path/to/project",
  "create_git_commits": true
}
```

### 运行编码会话

```http
POST /api/v1/long-running-agent/projects/:project_id/users/:user_id/sessions
Content-Type: application/json

{
  "max_features": 2,
  "session_notes": "Focus on authentication",
  "task_id": "session-123"
}
```

### 获取项目状态

```http
GET /api/v1/long-running-agent/projects/:project_id/status
```

### 获取进度报告

```http
GET /api/v1/long-running-agent/projects/:project_id/report?format=json
```

### 获取最近会话

```http
GET /api/v1/long-running-agent/projects/:project_id/sessions?limit=10
```

### 更新功能状态

```http
PATCH /api/v1/long-running-agent/projects/:project_id/features/:feature_id/status
Content-Type: application/json

{
  "status": "passing",
  "notes": "Feature implemented and tested"
}
```

### 运行自动会话

```http
POST /api/v1/long-running-agent/projects/:project_id/auto
Content-Type: application/json

{
  "max_iterations": 10,
  "task_id": "auto-123"
}
```

## 工作流程

### 1. 首次运行（Initializer Agent）

```
用户请求 → Initializer Agent
    ↓
生成功能列表（20-30+ 个功能）
    ↓
初始化进度跟踪
    ↓
创建初始 git commit
    ↓
返回：功能数量、会话 ID、下一步指南
```

### 2. 后续会话（Coding Agent）

```
用户请求 → Coding Agent
    ↓
读取进度文件
    ↓
选择 1-3 个功能（基于优先级和依赖）
    ↓
标记为 in_progress
    ↓
实现功能
    ↓
测试和验证
    ↓
标记为 passing 或保持 in_progress
    ↓
记录会话详情
    ↓
返回：完成的功能、文件修改、下一步
```

### 3. 自动会话

```
启动自动会话 → 检查是否有剩余功能
    ↓
循环运行编码会话
    ↓
每轮完成 1-2 个功能
    ↓
如果没有更多功能 → 停止
    ↓
返回：总迭代次数、总完成功能、最终状态
```

## 数据结构

### Feature（功能）

```typescript
interface Feature {
  id: string;
  description: string;
  status: 'failing' | 'passing' | 'in_progress';
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
  notes?: string;
}
```

### SessionRecord（会话记录）

```typescript
interface SessionRecord {
  session_id: string;
  timestamp: string;
  agent_name: string;
  actions: string[];
  features_completed: string[];
  features_in_progress: string[];
  files_modified: string[];
  notes?: string;
  next_steps?: string[];
}
```

### ProgressData（进度数据）

```typescript
interface ProgressData {
  project_id: string;
  task_description: string;
  features: Feature[];
  sessions: SessionRecord[];
  last_updated: string;
  total_features: number;
  completed_features: number;
  progress_percentage: number;
}
```

## 最佳实践

### 1. 功能列表生成

- 生成的功能应该是**具体、可测试、独立**的
- 功能描述应遵循模式："用户可以 [动作] 并看到 [结果]"
- 考虑边界情况、错误处理、可访问性、性能和安全性
- 高优先级功能应该是关键路径上的功能

### 2. 会话管理

- **每次会话最多实现 1-3 个功能**
- 优先实现无依赖的高优先级功能
- 确保会话结束时代码处于**干净状态**
- 详细记录每个会话的操作和结果

### 3. 进度跟踪

- 及时更新功能状态
- 为每个状态变更添加说明
- 定期生成进度报告
- 使用 git commit 标记重要里程碑

### 4. 错误处理

- 如果功能实现失败，保持状态为 `in_progress`
- 在 notes 中记录失败原因
- 下次会话可以从失败的地方继续

## 使用示例

### 完整工作流程示例

```typescript
import { createLongRunningOrchestrator } from './agents/long-running-orchestrator';

async function buildApplication() {
  const orchestrator = await createLongRunningOrchestrator({
    project_id: 'my-project-123',
    user_id: 'user-456',
    provider_id: 'openai-provider',
    create_git_commits: true,
  });

  const initResult = await orchestrator.startNewProject({
    task_description: 'Build a modern task management application',
    project_context: 'A web app for managing daily tasks with team collaboration',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    constraints: [
      'Must follow SOLID principles',
      'Must have comprehensive tests',
      'Must be accessible (WCAG 2.1)',
    ],
  });

  console.log(`Initialized with ${initResult.features_generated} features`);

  for (let i = 0; i < 10; i++) {
    const sessionResult = await orchestrator.runCodingSession({
      max_features: 2,
      session_notes: `Session ${i + 1}`,
    });

    console.log(`Session completed: ${sessionResult.features_completed.length} features`);

    const status = await orchestrator.getProjectStatus();
    console.log(`Progress: ${status.progress_percentage.toFixed(1)}%`);

    if (status.available_features.length === 0) {
      console.log('All features completed!');
      break;
    }
  }

  const report = await orchestrator.getProgressReport('txt');
  console.log(report);
}

buildApplication();
```

## 与 Anthropic 文章的对应关系

| 文章概念 | 实现组件 | 说明 |
|---------|----------|------|
| Initializer Agent | `initializer.agent.ts` | 设置初始环境 |
| Coding Agent | `coding.agent.ts` | 增量实现功能 |
| claude-progress.txt | `progress-tracking.service.ts` | 进度跟踪系统 |
| Feature List | `feature-list.service.ts` | 功能列表管理 |
| Clean State | Coding Agent 的 session workflow | 确保代码干净状态 |
| Next Steps | SessionRecord.next_steps | 为下次会话提供指导 |

## 故障排查

### 问题：项目未初始化

**错误信息：** "Project not initialized. Call startNewProject first."

**解决方案：**
```typescript
await orchestrator.startNewProject({
  task_description: '...',
});
```

### 问题：没有可用功能

**错误信息：** "No features to implement"

**解决方案：**
- 检查进度报告
- 查看是否所有功能都已完成
- 如果需要，可以添加新功能或重置功能状态

### 问题：功能依赖未满足

**表现：** 某些功能不会被选择实现

**解决方案：**
- 先实现依赖的功能
- 检查功能列表中的依赖关系是否正确
- 可以手动调整功能优先级

## 性能优化建议

1. **限制每次会话的功能数量**：建议 1-3 个
2. **使用自动会话模式**：对于大量功能，可以使用自动会话
3. **定期清理旧会话记录**：避免进度文件过大
4. **使用 git commit**：标记重要里程碑，便于回滚

## 安全考虑

1. **验证用户权限**：确保只有授权用户可以访问项目
2. **保护进度文件**：使用适当的文件权限
3. **验证输入**：所有 API 输入都应验证和清理
4. **记录审计日志**：跟踪所有项目操作

## 未来改进方向

1. **并行功能实现**：支持同时实现多个独立功能
2. **智能功能推荐**：基于历史数据推荐下一步功能
3. **自动测试集成**：自动运行测试验证功能
4. **代码质量检查**：集成 linter 和格式化工具
5. **依赖可视化**：生成功能依赖关系图
