# Design: Redesign Linear Workflow

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    WorkflowProvider                       │    │
│  │  (全局工作流状态管理)                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  剧本    │ │  角色    │ │  场景    │ │  分镜    │           │
│  │  编辑器  │ │  管理    │ │  解析    │ │  制作    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    ConsistencyEngine                     │    │
│  │  (一致性引擎：角色引用、场景关联、数据同步)                │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        API Layer                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Script  │ │Character │ │  Scene   │ │  Shot    │           │
│  │  API     │ │  API     │ │  API     │ │  API     │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                        Backend Services                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Script  │ │Character │ │  Scene   │ │  Shot    │           │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    AI Services                           │    │
│  │  (剧本解析、小说转换、图像生成、视频生成)                  │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        Database                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Project  │ │Character │ │  Scene   │ │  Shot    │           │
│  │  Table   │ │  Table   │ │  Table   │ │  Table   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## UI Layout Design

### 整体布局

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: 项目名称 + 全局操作                                      │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                    │
│   Sidebar  │                   Main Content                     │
│            │                                                    │
│  ┌──────┐  │  ┌────────────────────────────────────────────┐   │
│  │ 1.剧本│  │  │                                            │   │
│  │   ✓  │  │  │                                            │   │
│  └──────┘  │  │           当前步骤的工作区                   │   │
│  ┌──────┐  │  │                                            │   │
│  │ 2.角色│  │  │                                            │   │
│  │   ○  │  │  │                                            │   │
│  └──────┘  │  │                                            │   │
│  ┌──────┐  │  │                                            │   │
│  │ 3.场景│  │  │                                            │   │
│  │   ○  │  │  │                                            │   │
│  └──────┘  │  │                                            │   │
│  ┌──────┐  │  │                                            │   │
│  │ 4.分镜│  │  │                                            │   │
│  │   ○  │  │  │                                            │   │
│  └──────┘  │  └────────────────────────────────────────────┘   │
│            │                                                    │
│  ──────────│                                                    │
│  设置      │                                                    │
│  导出      │                                                    │
│            │                                                    │
└────────────┴────────────────────────────────────────────────────┘
```

### Sidebar 设计规范

```typescript
interface WorkflowStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'pending' | 'in_progress' | 'completed';
  subSteps?: WorkflowStep[];
  required: boolean;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'script',
    name: '剧本',
    icon: <FileText />,
    status: 'pending',
    required: true,
    subSteps: [
      { id: 'script-input', name: '输入内容', status: 'pending', required: true },
      { id: 'script-edit', name: '编辑打磨', status: 'pending', required: false },
    ]
  },
  {
    id: 'characters',
    name: '角色',
    icon: <Users />,
    status: 'pending',
    required: true,
    subSteps: [
      { id: 'char-define', name: '定义角色', status: 'pending', required: true },
      { id: 'char-portrait', name: '定妆照', status: 'pending', required: true },
    ]
  },
  {
    id: 'scenes',
    name: '场景',
    icon: <Map />,
    status: 'pending',
    required: true,
  },
  {
    id: 'storyboard',
    name: '分镜',
    icon: <LayoutGrid />,
    status: 'pending',
    required: true,
  },
];
```

## Data Flow Design

### 核心数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                         数据流向图                               │
└─────────────────────────────────────────────────────────────────┘

剧本输入
    │
    ▼
┌─────────────┐
│ 剧本解析器  │ ──────► 提取角色列表
│             │ ──────► 提取场景列表
│             │ ──────► 生成分镜结构
└─────────────┘
    │
    ▼
角色定妆照生成
    │
    ├──► 角色参考图 (Base64)
    │
    └──► 角色视觉描述 (Prompt)
            │
            ▼
    ┌─────────────────┐
    │ 角色一致性引擎   │
    │                 │
    │ • 定妆照引用    │
    │ • 服装变体管理  │
    │ • 一致性检测    │
    └─────────────────┘
            │
            ▼
场景概念图生成
    │
    ├──► 场景参考图 (Base64)
    │
    └──► 场景视觉描述 (Prompt)
            │
            ▼
    ┌─────────────────┐
    │ 场景连续性引擎   │
    │                 │
    │ • 场景引用      │
    │ • 光影一致性    │
    │ • 时间线关联    │
    └─────────────────┘
            │
            ▼
分镜制作
    │
    ├──► 引用角色定妆照
    ├──► 引用场景参考图
    ├──► 生成关键帧
    └──► 生成视频
```

### 数据模型设计

```typescript
interface Project {
  id: string;
  name: string;
  workflowState: WorkflowState;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowState {
  currentStep: WorkflowStepId;
  completedSteps: WorkflowStepId[];
  stepData: {
    script?: ScriptData;
    characters?: CharacterData[];
    scenes?: SceneData[];
    storyboard?: StoryboardData;
  };
}

interface ScriptData {
  id: string;
  content: string;
  format: 'standard' | 'novel' | 'screenplay';
  parsedScenes: ParsedScene[];
  parsedCharacters: ParsedCharacter[];
  version: number;
  history: ScriptVersion[];
}

interface CharacterData {
  id: string;
  name: string;
  description: string;
  portrait: CharacterPortrait;
  wardrobes: Wardrobe[];
  consistencyScore: number;
}

interface CharacterPortrait {
  id: string;
  imageUrl: string;
  prompt: string;
  negativePrompt: string;
  generatedAt: Date;
  model: string;
  isLocked: boolean;
}

interface Wardrobe {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  basedOnPortrait: string;
}

interface SceneData {
  id: string;
  name: string;
  description: string;
  location: string;
  timeOfDay: string;
  atmosphere: string;
  referenceImages: SceneReferenceImage[];
  characters: string[];
}

interface SceneReferenceImage {
  id: string;
  imageUrl: string;
  prompt: string;
  angle: 'wide' | 'medium' | 'close';
}

interface StoryboardData {
  id: string;
  shots: ShotData[];
}

interface ShotData {
  id: string;
  sceneId: string;
  characterIds: string[];
  actionDescription: string;
  cameraMovement: string;
  duration: number;
  startFrame?: FrameData;
  endFrame?: FrameData;
  videoUrl?: string;
}

interface FrameData {
  id: string;
  imageUrl: string;
  prompt: string;
  characterReferences: string[];
  sceneReference: string;
}
```

## Component Architecture

### 核心组件树

```
App
└── WorkflowProvider
    └── ProjectLayout
        ├── Header
        │   ├── ProjectTitle
        │   ├── GlobalActions
        │   └── UserMenu
        │
        ├── WorkflowSidebar
        │   ├── WorkflowSteps
        │   │   ├── ScriptStep
        │   │   ├── CharactersStep
        │   │   ├── ScenesStep
        │   │   └── StoryboardStep
        │   ├── StepProgress
        │   └── QuickActions
        │
        └── MainContent
            ├── ScriptWorkspace
            │   ├── ScriptEditor
            │   ├── ScriptPreview
            │   ├── NovelImporter
            │   └── ScriptAI
            │
            ├── CharactersWorkspace
            │   ├── CharacterList
            │   ├── CharacterEditor
            │   ├── PortraitGenerator
            │   └── WardrobeManager
            │
            ├── ScenesWorkspace
            │   ├── SceneList
            │   ├── SceneEditor
            │   ├── SceneParser
            │   └── SceneConceptGenerator
            │
            └── StoryboardWorkspace
                ├── ShotGrid
                ├── ShotEditor
                ├── FrameGenerator
                └── VideoGenerator
```

### 状态管理架构

```typescript
interface WorkflowContextType {
  state: WorkflowState;
  actions: {
    setCurrentStep: (step: WorkflowStepId) => void;
    completeStep: (step: WorkflowStepId) => void;
    updateStepData: (step: WorkflowStepId, data: any) => void;
    navigateToStep: (step: WorkflowStepId) => void;
  };
  computed: {
    progress: number;
    canProceed: boolean;
    nextStep: WorkflowStepId | null;
    previousStep: WorkflowStepId | null;
  };
}
```

## Consistency Engine Design

### 角色一致性机制

```
┌─────────────────────────────────────────────────────────────────┐
│                     角色一致性引擎                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 定妆照锁定机制                                               │
│     ┌─────────────┐                                             │
│     │ 角色创建    │ ──► 生成定妆照 ──► 锁定定妆照               │
│     └─────────────┘                                             │
│                                                                  │
│  2. 引用传递机制                                                 │
│     ┌─────────────┐                                             │
│     │ 分镜生成    │ ──► 读取定妆照 ──► 注入 Prompt              │
│     └─────────────┘                                             │
│                                                                  │
│  3. 一致性检测                                                   │
│     ┌─────────────┐                                             │
│     │ 图像生成后  │ ──► 对比定妆照 ──► 计算相似度               │
│     └─────────────┘                                             │
│                                                                  │
│  4. 服装变体系统                                                 │
│     ┌─────────────┐                                             │
│     │ 服装切换    │ ──► 保持面部特征 ──► 更新服装参考           │
│     └─────────────┘                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 一致性 Prompt 模板

```typescript
const CHARACTER_CONSISTENCY_PROMPT = `
## 角色一致性生成规则

### 基础信息
- 角色名称: {characterName}
- 定妆照参考: {portraitImageUrl}
- 角色描述: {characterDescription}

### 生成要求
1. 面部特征必须与定妆照保持一致
2. 服装可根据场景调整，但需保持角色气质
3. 表情和动作符合剧情需要
4. 光影与场景保持统一

### 服装变体
{wardrobeDescription}

### 负面提示词
{negativePrompt}
`;
```

## API Design

### 新增 API 端点

```yaml
# 剧本相关
POST /api/projects/:id/script/parse
  - 解析剧本，提取场景和角色

POST /api/projects/:id/script/convert-novel
  - 将小说转换为剧本格式

# 角色一致性相关
POST /api/characters/:id/portrait/generate
  - 生成角色定妆照

POST /api/characters/:id/portrait/lock
  - 锁定定妆照

GET /api/characters/:id/consistency-score
  - 获取角色一致性评分

# 场景相关
POST /api/scenes/:id/concept/generate
  - 生成场景概念图

# 分镜相关
POST /api/shots/:id/generate-with-references
  - 基于角色和场景引用生成分镜

# 工作流相关
GET /api/projects/:id/workflow/state
  - 获取工作流状态

PUT /api/projects/:id/workflow/state
  - 更新工作流状态
```

## Migration Strategy

### 数据迁移

```sql
-- 新增角色定妆照表
CREATE TABLE character_portraits (
  id UUID PRIMARY KEY,
  character_id UUID REFERENCES characters(id),
  image_url TEXT NOT NULL,
  prompt TEXT,
  negative_prompt TEXT,
  model VARCHAR(100),
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 新增场景参考图表
CREATE TABLE scene_references (
  id UUID PRIMARY KEY,
  scene_id UUID REFERENCES scenes(id),
  image_url TEXT NOT NULL,
  prompt TEXT,
  angle VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 新增工作流状态表
CREATE TABLE workflow_states (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  current_step VARCHAR(50),
  completed_steps TEXT[],
  step_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 新增镜头引用表
ALTER TABLE shots ADD COLUMN character_ids UUID[];
ALTER TABLE shots ADD COLUMN scene_reference_id UUID;
```

## Performance Considerations

### 前端优化

1. **懒加载**：各工作区组件按需加载
2. **虚拟滚动**：分镜网格使用虚拟滚动
3. **图片压缩**：Base64 图片压缩后再存储
4. **状态缓存**：工作流状态本地缓存

### 后端优化

1. **批量生成**：支持批量生成定妆照和场景图
2. **任务队列**：AI 生成任务异步处理
3. **CDN 加速**：生成图片上传 CDN

## Security Considerations

1. **输入验证**：剧本内容长度限制
2. **权限控制**：项目级别的访问控制
3. **API 限流**：AI 生成接口限流保护

## Testing Strategy

### 单元测试

- WorkflowProvider 状态管理
- SceneParser 解析逻辑
- ConsistencyEngine 一致性检测

### 集成测试

- 完整工作流端到端测试
- 数据流转验证

### E2E 测试

- 用户完成完整创作流程
- 角色一致性验证
