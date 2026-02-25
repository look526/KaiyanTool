# KaiyanTool 优化方案 - 基于LIKE AI.pro分析

## 一、当前项目现状分析

### 1.1 技术栈

**前端**
- React 19.2.0
- Vite
- TypeScript 5.8.0
- Tailwind CSS 4.1.18
- Zustand (状态管理)
- React Router DOM 6.22.0
- Monaco Editor (代码编辑)

**后端**
- Express
- TypeScript 5.8.0
- Prisma (ORM)
- PostgreSQL (数据库)
- Redis (缓存/队列)
- Bull (任务队列)

### 1.2 现有功能模块

✅ 已实现
- 项目管理
- 脚本编辑器
- AI提供商管理
- 角色管理
- 场景管理
- 分镜/镜头管理
- 视频生成
- 团队协作
- 资产管理
- 工作流管理

### 1.3 与LIKE AI.pro的对比

| 功能模块 | LIKE AI.pro | KaiyanTool | 差距分析 |
|---------|-------------|------------|---------|
| 视频比例选择 | ✅ 16:9/9:16 | ❌ 缺失 | 需要添加 |
| 风格预设系统 | ✅ 9种预设+自定义 | ❌ 缺失 | 需要添加 |
| 剧本管理 | ✅ 上传+AI生成 | ✅ 已实现 | 功能完善 |
| 角色管理 | ✅ 独立模块 | ✅ 已实现 | 需要增强 |
| 物品管理 | ✅ 独立模块 | ❌ 缺失 | 需要添加 |
| 场景管理 | ✅ 独立模块 | ✅ 已实现 | 需要增强 |
| 分镜管理 | ✅ 完整工作台 | ✅ 已实现 | 需要优化 |
| 团队协作 | ✅ 权限+版本控制 | ✅ 已实现 | 功能完善 |
| 数据分析 | ✅ 可视化看板 | ❌ 缺失 | 需要添加 |
| 左侧导航 | ✅ 7大模块 | ✅ 已实现 | 需要优化 |

## 二、优化方案设计

### 2.1 核心优化方向

基于LIKE AI.pro的优点，我们将在以下方面进行优化：

1. **用户体验优化**
   - 优化项目创建流程
   - 添加风格预设系统
   - 改进左侧导航布局

2. **功能完整性**
   - 添加视频比例选择
   - 实现物品管理模块
   - 添加数据分析看板

3. **界面设计**
   - 优化视觉设计
   - 改进交互体验
   - 提升专业感

### 2.2 详细优化方案

#### 优化一：项目创建流程优化

**目标**：参考LIKE AI.pro，在项目创建时选择视频比例和风格

**实施方案**：

1. **修改CreateProjectPage组件**
   - 添加视频比例选择器（16:9 / 9:16）
   - 添加风格选择器（9种预设+自定义）
   - 优化表单布局和交互

2. **数据库扩展**
   ```prisma
   model Project {
     // 现有字段...
     aspectRatio     String   @default("16:9")  // 16:9 或 9:16
     style           String?                   // 风格ID
     customStyle     Json?                     // 自定义风格参数
   }
   ```

3. **风格预设数据**
   ```typescript
   // apps/web/src/config/styles.ts
   export const STYLE_PRESETS = [
     {
       id: 'cinematic',
       name: '电影质感',
       description: '专业光影、电影级调色',
       preview: '/styles/cinematic.jpg',
       promptKeywords: ['cinematic', 'professional lighting', 'film color grading']
     },
     {
       id: 'realistic',
       name: '高清实拍',
       description: '写实风格、高清晰度',
       preview: '/styles/realistic.jpg',
       promptKeywords: ['realistic', 'high definition', 'natural colors']
     },
     {
       id: 'gothic',
       name: '暗黑哥特',
       description: '低饱和度、神秘氛围',
       preview: '/styles/gothic.jpg',
       promptKeywords: ['gothic', 'dark atmosphere', 'mysterious']
     },
     {
       id: 'cyberpunk',
       name: '赛博朋克',
       description: '霓虹色调、科技元素',
       preview: '/styles/cyberpunk.jpg',
       promptKeywords: ['cyberpunk', 'neon lights', 'futuristic']
     },
     {
       id: 'anime',
       name: '日漫风格',
       description: '日系画风、二次元特征',
       preview: '/styles/anime.jpg',
       promptKeywords: ['anime style', 'Japanese animation', '2D']
     },
     {
       id: 'shinkai',
       name: '新海诚风',
       description: '唯美光影、细腻情感',
       preview: '/styles/shinkai.jpg',
       promptKeywords: ['Makoto Shinkai style', 'beautiful lighting', 'emotional']
     },
     {
       id: 'ink',
       name: '国风水墨',
       description: '水墨笔触、东方美学',
       preview: '/styles/ink.jpg',
       promptKeywords: ['Chinese ink painting', 'traditional art', 'minimalist']
     },
     {
       id: 'game',
       name: '游戏原画',
       description: '精致细节、游戏感',
       preview: '/styles/game.jpg',
       promptKeywords: ['game concept art', 'detailed', 'high quality']
     },
     {
       id: 'custom',
       name: '自定义',
       description: '用户自定义风格参数',
       preview: '/styles/custom.jpg',
       promptKeywords: []
     }
   ];
   ```

**UI设计**：
```
┌─────────────────────────────────────────┐
│  创建新项目                          │
├─────────────────────────────────────────┤
│  项目名称: [_____________________]    │
│  描述:    [_____________________]    │
│                                     │
│  视频比例:                           │
│  ┌─────────┐  ┌─────────┐        │
│  │  16:9   │  │  9:16   │        │
│  │ 横屏    │  │ 竖屏    │        │
│  └─────────┘  └─────────┘        │
│                                     │
│  风格选择:                           │
│  ┌─────────────────────────────┐      │
│  │ [电影质感] [高清实拍] ...  │      │
│  │  [预览图]               │      │
│  └─────────────────────────────┘      │
│                                     │
│  [取消]  [创建项目]                  │
└─────────────────────────────────────────┘
```

---

#### 优化二：物品管理模块

**目标**：实现独立的物品管理功能，与角色、场景并列

**实施方案**：

1. **数据库设计**
   ```prisma
   model Item {
     id          String   @id @default(cuid())
     projectId    String
     project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
     name        String
     type        String   // 道具、服装、配饰等
     image       String?
     description String?
     prompt      String?  // AI生成提示词
     scenes      Scene[]  @relation("ItemScenes")
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt

     @@index([projectId])
   }

   model Scene {
     // 现有字段...
     items Item[] @relation("ItemScenes")
   }
   ```

2. **API路由**
   ```typescript
   // apps/api/src/routes/item.routes.ts
   router.post('/items', authenticate, createItem);
   router.get('/items/:projectId', authenticate, getItems);
   router.get('/items/:id', authenticate, getItem);
   router.put('/items/:id', authenticate, updateItem);
   router.delete('/items/:id', authenticate, deleteItem);
   ```

3. **前端页面**
   ```typescript
   // apps/web/src/pages/ItemsPage.tsx
   - 物品列表展示
   - 物品创建/编辑表单
   - 物品类型分类
   - 物品关联场景
   - 批量上传
   ```

**UI设计**：
```
┌─────────────────────────────────────────┐
│  物品管理                            │
├─────────────────────────────────────────┤
│  [搜索物品...] [+ 新建物品]          │
│                                     │
│  分类: [全部] [道具] [服装] [配饰]   │
│                                     │
│  ┌─────────┐ ┌─────────┐          │
│  │ [图片]   │ │ [图片]   │          │
│  │ 宝剑     │ │ 魔法杖   │          │
│  │ 道具     │ │ 道具     │          │
│  └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐          │
│  │ [图片]   │ │ [图片]   │          │
│  │ 战甲     │ │ 斗篷     │          │
│  │ 服装     │ │ 服装     │          │
│  └─────────┘ └─────────┘          │
└─────────────────────────────────────────┘
```

---

#### 优化三：数据分析看板

**目标**：添加项目数据分析和可视化功能

**实施方案**：

1. **数据库查询优化**
   ```typescript
   // apps/api/src/services/analytics.service.ts
   export class AnalyticsService {
     async getProjectAnalytics(projectId: string) {
       return {
         progress: await this.getProjectProgress(projectId),
         shotCount: await this.getShotCount(projectId),
         resourceUsage: await this.getResourceUsage(projectId),
         teamActivity: await this.getTeamActivity(projectId),
         generationStats: await this.getGenerationStats(projectId)
       };
     }
   }
   ```

2. **API路由**
   ```typescript
   // apps/api/src/routes/analytics.routes.ts
   router.get('/analytics/project/:projectId', authenticate, getProjectAnalytics);
   router.get('/analytics/overview', authenticate, getOverviewAnalytics);
   ```

3. **前端组件**
   ```typescript
   // apps/web/src/components/analytics/
   - AnalyticsDashboard.tsx (主看板)
   - ProgressChart.tsx (进度图表)
   - ResourceUsageCard.tsx (资源使用卡片)
   - TeamActivityChart.tsx (团队活跃度图表)
   - GenerationStats.tsx (生成统计)
   ```

**UI设计**：
```
┌─────────────────────────────────────────┐
│  数据分析                            │
├─────────────────────────────────────────┤
│  项目进度:  ████████░░░ 75%        │
│                                     │
│  ┌─────────────┐ ┌─────────────┐  │
│  │ 分镜数量    │ │ 生成统计    │  │
│  │ 128个      │ │ 85% 成功率  │  │
│  └─────────────┘ └─────────────┘  │
│                                     │
│  ┌─────────────┐ ┌─────────────┐  │
│  │ 资源使用    │ │ 团队活跃度  │  │
│  │ [图表]      │ │ [图表]      │  │
│  └─────────────┘ └─────────────┘  │
└─────────────────────────────────────────┘
```

---

#### 优化四：左侧导航优化

**目标**：参考LIKE AI.pro的7大模块布局，优化导航体验

**实施方案**：

1. **优化导航结构**
   ```typescript
   // apps/web/src/components/Sidebar.tsx
   const NAVIGATION_ITEMS = [
     { id: 'projects', icon: Folder, label: '项目' },
     { id: 'characters', icon: Users, label: '角色' },
     { id: 'items', icon: Package, label: '物品' },  // 新增
     { id: 'scenes', icon: Image, label: '场景' },
     { id: 'shots', icon: Film, label: '分镜' },
     { id: 'team', icon: Users2, label: '团队' },
     { id: 'analytics', icon: BarChart3, label: '数据' }  // 新增
   ];
   ```

2. **优化项目详情页导航**
   ```typescript
   // apps/web/src/layouts/ProjectLayout.tsx
   const PROJECT_NAV_ITEMS = [
     { id: 'overview', label: '概览' },
     { id: 'script', label: '剧本' },
     { id: 'characters', label: '角色' },
     { id: 'items', label: '物品' },
     { id: 'scenes', label: '场景' },
     { id: 'shots', label: '分镜' },
     { id: 'team', label: '团队' },
     { id: 'analytics', label: '数据' }
   ];
   ```

**UI设计**：
```
┌──────────┬──────────────────────────────┐
│  项目     │  工作台                    │
├──────────┤  ┌──────────────────────┐  │
│  角色     │  │                    │  │
├──────────┤  │   分镜编辑区域       │  │
│  物品     │  │                    │  │
├──────────┤  │                    │  │
│  场景     │  │                    │  │
├──────────┤  └──────────────────────┘  │
│  分镜     │                            │
├──────────┤                            │
│  团队     │                            │
├──────────┤                            │
│  数据     │                            │
└──────────┴──────────────────────────────┘
```

---

#### 优化五：风格预设系统集成

**目标**：将风格预设应用到AI生成流程

**实施方案**：

1. **风格提示词生成器**
   ```typescript
   // apps/web/src/lib/stylePromptGenerator.ts
   export function generateStylePrompt(
     styleId: string,
     basePrompt: string
   ): string {
     const style = STYLE_PRESETS.find(s => s.id === styleId);
     if (!style) return basePrompt;

     const styleKeywords = style.promptKeywords.join(', ');
     return `${basePrompt}, ${styleKeywords}`;
   }
   ```

2. **AI生成服务集成**
   ```typescript
   // apps/api/src/services/image-generation.service.ts
   async generateImage(prompt: string, styleId?: string) {
     const enhancedPrompt = styleId
       ? generateStylePrompt(styleId, prompt)
       : prompt;

     return await this.aiProvider.generateImage(enhancedPrompt);
   }
   ```

3. **分镜生成应用风格**
   ```typescript
   // apps/web/src/pages/ShotsPage.tsx
   async function generateShots() {
     const project = await fetchProject(projectId);
     const stylePrompt = generateStylePrompt(
       project.style,
       shot.description
     );

     await generateShotImage(shot.id, stylePrompt);
   }
   ```

---

#### 优化六：角色管理增强

**目标**：增强角色管理功能，支持角色一致性控制

**实施方案**：

1. **角色特征提取**
   ```typescript
   // apps/web/src/lib/characterFeatureExtractor.ts
   export interface CharacterFeatures {
     facialFeatures: string[];
     hairStyle: string;
     clothing: string;
     accessories: string[];
     colorPalette: string[];
   }

   export async function extractCharacterFeatures(
     characterImage: string
   ): Promise<CharacterFeatures> {
     // 使用AI分析角色图像，提取特征
   }
   ```

2. **角色一致性服务**
   ```typescript
   // apps/api/src/services/character-consistency.service.ts
   export class CharacterConsistencyService {
     async ensureConsistency(
       characterId: string,
       prompt: string
     ): Promise<string> {
       const character = await this.getCharacter(characterId);
       const features = character.features;

       const consistencyPrompt = `
         ${prompt}
         Character must match these features:
         - Face: ${features.facialFeatures.join(', ')}
         - Hair: ${features.hairStyle}
         - Clothing: ${features.clothing}
         - Accessories: ${features.accessories.join(', ')}
         - Colors: ${features.colorPalette.join(', ')}
       `;

       return consistencyPrompt;
     }
   }
   ```

3. **角色三视图生成**
   ```typescript
   // apps/web/src/components/character/CharacterThreeView.tsx
   - 正面视图
   - 侧面视图
   - 背面视图
   - 一键生成三视图
   ```

---

#### 优化七：界面设计优化

**目标**：提升整体视觉设计，参考LIKE AI.pro的专业感

**实施方案**：

1. **设计系统升级**
   ```css
   /* apps/web/src/styles/design-system.css */
   :root {
     /* 颜色系统 */
     --color-primary: #6366f1;
     --color-primary-hover: #4f46e5;
     --color-secondary: #8b5cf6;
     --color-success: #10b981;
     --color-warning: #f59e0b;
     --color-error: #ef4444;

     /* 深色模式 */
     --bg-primary: #0f172a;
     --bg-secondary: #1e293b;
     --bg-tertiary: #334155;
     --text-primary: #f8fafc;
     --text-secondary: #94a3b8;
     --border-color: #334155;

     /* 间距系统 */
     --spacing-xs: 4px;
     --spacing-sm: 8px;
     --spacing-md: 16px;
     --spacing-lg: 24px;
     --spacing-xl: 32px;

     /* 圆角 */
     --radius-sm: 4px;
     --radius-md: 8px;
     --radius-lg: 12px;
     --radius-xl: 16px;

     /* 阴影 */
     --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
     --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
     --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
   }
   ```

2. **组件样式优化**
   ```typescript
   // apps/web/src/components/ui/card.tsx
   const Card = React.forwardRef<HTMLDivElement, CardProps>(
     ({ className, ...props }, ref) => (
       <div
         ref={ref}
         className={cn(
           "rounded-lg border border-slate-700 bg-slate-800/50",
           "backdrop-blur-sm",
           "hover:border-slate-600 transition-colors",
           className
         )}
         {...props}
       />
     )
   );
   ```

3. **动画效果**
   ```css
   /* apps/web/src/styles/animations.css */
   @keyframes fadeIn {
     from { opacity: 0; transform: translateY(10px); }
     to { opacity: 1; transform: translateY(0); }
   }

   @keyframes slideIn {
     from { transform: translateX(-100%); }
     to { transform: translateX(0); }
   }

   .animate-fade-in {
     animation: fadeIn 0.3s ease-out;
   }

   .animate-slide-in {
     animation: slideIn 0.3s ease-out;
   }
   ```

---

## 三、实施计划

### 阶段一：核心功能增强（优先级：高）

**时间：1-2周**

1. ✅ 项目创建流程优化
   - 添加视频比例选择
   - 添加风格预设系统
   - 优化表单布局

2. ✅ 物品管理模块
   - 数据库设计
   - API开发
   - 前端页面开发

3. ✅ 左侧导航优化
   - 重新设计导航结构
   - 添加物品和数据入口
   - 优化交互体验

### 阶段二：数据分析功能（优先级：中）

**时间：1周**

1. ✅ 数据分析看板
   - 后端服务开发
   - API接口实现
   - 前端组件开发

2. ✅ 可视化图表
   - 进度图表
   - 资源使用图表
   - 团队活跃度图表

### 阶段三：体验优化（优先级：中）

**时间：1周**

1. ✅ 风格系统集成
   - 提示词生成器
   - AI生成服务集成
   - 分镜生成应用

2. ✅ 角色管理增强
   - 角色特征提取
   - 一致性控制
   - 三视图生成

### 阶段四：界面设计优化（优先级：低）

**时间：1周**

1. ✅ 设计系统升级
   - 颜色系统优化
   - 组件样式统一
   - 动画效果添加

2. ✅ 整体视觉优化
   - 页面布局优化
   - 交互体验提升
   - 专业感增强

---

## 四、技术实现细节

### 4.1 数据库迁移

```sql
-- 添加项目风格字段
ALTER TABLE "Project" ADD COLUMN "aspectRatio" TEXT DEFAULT '16:9';
ALTER TABLE "Project" ADD COLUMN "style" TEXT;
ALTER TABLE "Project" ADD COLUMN "customStyle" JSONB;

-- 创建物品表
CREATE TABLE "Item" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "image" TEXT,
  "description" TEXT,
  "prompt" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  PRIMARY KEY ("id"),
  CONSTRAINT "Item_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
);

CREATE INDEX "Item_projectId_idx" ON "Item"("projectId");

-- 场景物品关联表
CREATE TABLE "_SceneItems" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,

  UNIQUE ("A", "B")
);

CREATE INDEX "_SceneItems_A_index" ON "_SceneItems"("A");
CREATE INDEX "_SceneItems_B_index" ON "_SceneItems"("B");
```

### 4.2 API接口设计

```typescript
// 物品管理接口
interface CreateItemDTO {
  projectId: string;
  name: string;
  type: string;
  image?: string;
  description?: string;
  prompt?: string;
}

interface UpdateItemDTO {
  name?: string;
  type?: string;
  image?: string;
  description?: string;
  prompt?: string;
}

// 数据分析接口
interface ProjectAnalytics {
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
  shotCount: number;
  resourceUsage: {
    characters: number;
    scenes: number;
    items: number;
  };
  teamActivity: {
    activeMembers: number;
    actionsToday: number;
    actionsThisWeek: number;
  };
  generationStats: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
}
```

### 4.3 前端组件结构

```
apps/web/src/
├── components/
│   ├── analytics/
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── ProgressChart.tsx
│   │   ├── ResourceUsageCard.tsx
│   │   ├── TeamActivityChart.tsx
│   │   └── GenerationStats.tsx
│   ├── item/
│   │   ├── ItemCard.tsx
│   │   ├── ItemForm.tsx
│   │   ├── ItemGrid.tsx
│   │   └── ItemUpload.tsx
│   └── style/
│       ├── StyleSelector.tsx
│       ├── StyleCard.tsx
│       └── StylePreview.tsx
├── pages/
│   ├── ItemsPage.tsx
│   └── AnalyticsPage.tsx
├── lib/
│   ├── stylePromptGenerator.ts
│   └── characterFeatureExtractor.ts
└── config/
    └── styles.ts
```

---

## 五、预期效果

### 5.1 用户体验提升

- ✅ 项目创建流程更清晰，减少决策成本
- ✅ 风格预设降低AI生成门槛
- ✅ 物品管理完善资源体系
- ✅ 数据分析提供决策支持
- ✅ 导航优化提升操作效率

### 5.2 功能完整性提升

- ✅ 覆盖LIKE AI.pro的7大核心模块
- ✅ 支持多平台视频比例
- ✅ 风格体系完善
- ✅ 数据驱动决策

### 5.3 竞争力提升

- ✅ 功能对标行业标杆
- ✅ 用户体验优化
- ✅ 专业感增强
- ✅ 差异化优势明显

---

## 六、总结

本优化方案基于LIKE AI.pro的优秀设计理念，结合KaiyanTool现有技术架构，提出了系统性的优化方向。通过分阶段实施，可以在保持系统稳定性的同时，逐步提升产品竞争力。

**核心价值**：
1. 降低用户创作门槛
2. 提升创作效率
3. 保证内容质量一致性
4. 提供数据驱动决策

**实施建议**：
- 优先实现高优先级功能
- 保持向后兼容
- 充分测试
- 收集用户反馈持续优化
