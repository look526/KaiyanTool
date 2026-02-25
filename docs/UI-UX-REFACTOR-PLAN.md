# 开演AI - UI/UX 页面重构项目计划书

## 📋 项目概述

### 项目背景
开演AI 是一个 AI 驱动的内容创作平台，包含剧本创作、角色管理、场景设计、分镜制作等功能模块。当前界面存在以下问题：
- 视觉风格不统一，各页面设计语言差异明显
- 组件复用率低，存在大量重复代码
- 暗色/亮色主题切换体验不连贯
- 部分页面美观度不足，影响用户留存

### 项目目标
1. **建立统一设计语言** - 制定完整的设计规范文档
2. **构建组件库** - 开发可复用的 UI 组件库
3. **实现风格切换** - 支持多主题切换且保持体验连续性
4. **提升视觉品质** - 全面提升界面美观度和用户体验

### 排除范围
- **首页 (HomePage)** - 不纳入本次重构范围

---

## 🎨 设计规范制定

### 1. 视觉风格定义

#### 主风格：Bento Grid（苹果风格模块化卡片）+ Minimalism

```
┌─────────────────────────────────────────────────────────────┐
│  Bento Grid (便当盒布局)                                     │
│  - 模块化卡片：不规则尺寸的圆角卡片组合                        │
│  - 内容密度变化：不同模块承载不同信息量                        │
│  - 悬停交互：hover 效果增强交互反馈                           │
│  - 视觉节奏：大小卡片交错创造节奏感                            │
│  - 苹果风格：简洁、留白、精致阴影                              │
├─────────────────────────────────────────────────────────────┤
│  Minimalism (极简主义)                                       │
│  - 大量留白: padding: 24px - 48px                            │
│  - 清晰层级: 使用阴影和模糊区分层级                           │
│  - 简洁图标: Lucide Icons (24x24 viewBox)                    │
│  - 有限色彩: 主色 + 辅助色 + 中性色                          │
│  - 圆角统一: 16px - 24px 大圆角                              │
└─────────────────────────────────────────────────────────────┘
```

#### Bento Grid 布局规范

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌─────────────────────┐  ┌──────────┐  ┌──────────┐               │
│  │                     │  │          │  │          │               │
│  │    Large Card       │  │  Small   │  │  Small   │               │
│  │    (2x2)            │  │  (1x1)   │  │  (1x1)   │               │
│  │                     │  │          │  │          │               │
│  └─────────────────────┘  └──────────┘  └──────────┘               │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────────────────┐   │
│  │          │  │          │  │                                 │   │
│  │  Small   │  │  Small   │  │       Wide Card (2x1)           │   │
│  │  (1x1)   │  │  (1x1)   │  │                                 │   │
│  │          │  │          │  │                                 │   │
│  └──────────┘  └──────────┘  └─────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────┐  ┌──────────┐  ┌──────────┐   │
│  │                                 │  │          │  │          │   │
│  │       Wide Card (2x1)           │  │  Small   │  │  Small   │   │
│  │                                 │  │  (1x1)   │  │  (1x1)   │   │
│  │                                 │  │          │  │          │   │
│  └─────────────────────────────────┘  └──────────┘  └──────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

卡片尺寸规范：
- Small (1x1): 180px - 240px
- Medium (1x2): 360px - 480px  
- Large (2x2): 360px - 480px (正方形)
- Wide (2x1): 360px - 480px (横向)
- Tall (1x2): 180px - 240px (纵向)

间距规范：
- 卡片间距: 16px - 24px
- 内边距: 20px - 32px
- 圆角: 16px - 24px
```

#### 色彩系统（苹果风格）
```css
/* 主色调 - 苹果蓝 (专业、简洁) */
--primary-50: #EFF6FF;
--primary-100: #DBEAFE;
--primary-500: #007AFF;
--primary-600: #0056CC;
--primary-700: #0044A3;

/* 辅助色 - 渐变 (多彩卡片) */
--accent-purple: #AF52DE;
--accent-pink: #FF2D55;
--accent-orange: #FF9500;
--accent-green: #34C759;
--accent-teal: #5AC8FA;
--accent-indigo: #5856D6;

/* 语义色 */
--success: #34C759;
--warning: #FF9500;
--error: #FF3B30;
--info: #007AFF;

/* 中性色 - Dark Mode (苹果深色) */
--dark-bg-primary: #000000;
--dark-bg-secondary: #1C1C1E;
--dark-bg-elevated: #2C2C2E;
--dark-bg-tertiary: #3A3A3C;
--dark-text-primary: #FFFFFF;
--dark-text-secondary: #EBEBF5;
--dark-text-tertiary: #8E8E93;
--dark-separator: #38383A;

/* 中性色 - Light Mode (苹果浅色) */
--light-bg-primary: #FFFFFF;
--light-bg-secondary: #F2F2F7;
--light-bg-elevated: #FFFFFF;
--light-bg-tertiary: #E5E5EA;
--light-text-primary: #000000;
--light-text-secondary: #3C3C43;
--light-text-tertiary: #8E8E93;
--light-separator: #C6C6C8;

/* Bento 卡片背景色 */
--card-bg-dark: rgba(44, 44, 46, 0.8);
--card-bg-light: rgba(255, 255, 255, 0.9);
--card-border-dark: rgba(255, 255, 255, 0.1);
--card-border-light: rgba(0, 0, 0, 0.05);
```

#### 字体系统
```css
/* 主字体 - Inter (现代、清晰) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* 代码字体 - JetBrains Mono */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

/* 字体层级 */
--font-size-xs: 12px;    /* 辅助信息 */
--font-size-sm: 14px;    /* 次要内容 */
--font-size-base: 16px;  /* 正文 */
--font-size-lg: 18px;    /* 小标题 */
--font-size-xl: 20px;    /* 卡片标题 */
--font-size-2xl: 24px;   /* 区块标题 */
--font-size-3xl: 30px;   /* 页面标题 */
--font-size-4xl: 36px;   /* 大标题 */

/* 字重 */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* 行高 */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

#### 间距系统
```css
/* 基于 4px 网格 */
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
--spacing-20: 80px;
```

#### 圆角系统
```css
--radius-sm: 6px;     /* 小按钮、标签 */
--radius-md: 10px;    /* 输入框、小卡片 */
--radius-lg: 16px;    /* 卡片、模态框 */
--radius-xl: 20px;    /* 大卡片 */
--radius-2xl: 24px;   /* 特殊容器 */
--radius-full: 9999px; /* 胶囊按钮、头像 */
```

#### 阴影系统（苹果风格）
```css
/* Dark Mode 阴影 - 柔和精致 */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.6);
--shadow-card: 0 4px 12px rgba(0, 0, 0, 0.15);

/* Light Mode 阴影 - 轻盈通透 */
--shadow-sm-light: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-md-light: 0 4px 8px rgba(0, 0, 0, 0.1);
--shadow-lg-light: 0 8px 16px rgba(0, 0, 0, 0.12);
--shadow-xl-light: 0 16px 32px rgba(0, 0, 0, 0.15);
--shadow-card-light: 0 4px 12px rgba(0, 0, 0, 0.08);

/* Bento 卡片悬停阴影 */
--shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.2);
--shadow-hover-light: 0 8px 24px rgba(0, 0, 0, 0.12);

/* 彩色卡片发光效果 */
--glow-purple: 0 4px 20px rgba(175, 82, 222, 0.3);
--glow-pink: 0 4px 20px rgba(255, 45, 85, 0.3);
--glow-orange: 0 4px 20px rgba(255, 149, 0, 0.3);
--glow-green: 0 4px 20px rgba(52, 199, 89, 0.3);
--glow-blue: 0 4px 20px rgba(0, 122, 255, 0.3);
```

### 2. 动效规范

#### 过渡动画
```css
/* 标准过渡 */
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;

/* 缓动函数 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

#### 交互动效
```css
/* Hover 效果 - Bento 卡片 */
.bento-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.bento-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-hover);
}

/* 点击反馈 */
.click-scale:active {
  transform: scale(0.98);
}

/* 卡片内部元素动画 */
.bento-card-icon {
  transition: transform 0.3s ease;
}
.bento-card:hover .bento-card-icon {
  transform: scale(1.1) rotate(5deg);
}

/* 加载动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Bento 卡片入场动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bento-card {
  animation: fadeInUp 0.5s ease forwards;
}

/* 错开动画延迟 */
.bento-card:nth-child(1) { animation-delay: 0ms; }
.bento-card:nth-child(2) { animation-delay: 50ms; }
.bento-card:nth-child(3) { animation-delay: 100ms; }
.bento-card:nth-child(4) { animation-delay: 150ms; }
.bento-card:nth-child(5) { animation-delay: 200ms; }
.bento-card:nth-child(6) { animation-delay: 250ms; }
```

---

## 🧩 组件库开发

### 1. 基础组件 (Primitive Components)

| 组件名称 | 文件路径 | 说明 |
|---------|---------|------|
| Button | `components/ui/Button.tsx` | 主按钮、次按钮、幽灵按钮、图标按钮 |
| Input | `components/ui/Input.tsx` | 文本输入、搜索框、密码框 |
| Textarea | `components/ui/Textarea.tsx` | 多行文本输入 |
| Select | `components/ui/Select.tsx` | 下拉选择器 |
| Checkbox | `components/ui/Checkbox.tsx` | 复选框 |
| Radio | `components/ui/Radio.tsx` | 单选框 |
| Switch | `components/ui/Switch.tsx` | 开关切换 |
| Badge | `components/ui/Badge.tsx` | 标签徽章 |
| Avatar | `components/ui/Avatar.tsx` | 用户头像 |
| Icon | `components/ui/Icon.tsx` | 图标组件 (Lucide) |

### 2. 布局组件 (Layout Components)

| 组件名称 | 文件路径 | 说明 |
|---------|---------|------|
| Container | `components/ui/Container.tsx` | 内容容器 |
| Card | `components/ui/Card.tsx` | 卡片容器 |
| Modal | `components/ui/Modal.tsx` | 模态对话框 |
| Drawer | `components/ui/Drawer.tsx` | 抽屉侧边栏 |
| Divider | `components/ui/Divider.tsx` | 分割线 |
| Stack | `components/ui/Stack.tsx` | 弹性布局 |
| Grid | `components/ui/Grid.tsx` | 网格布局 |

### 3. 导航组件 (Navigation Components)

| 组件名称 | 文件路径 | 说明 |
|---------|---------|------|
| Navbar | `components/ui/Navbar.tsx` | 顶部导航栏 |
| Sidebar | `components/ui/Sidebar.tsx` | 侧边导航栏 |
| Tabs | `components/ui/Tabs.tsx` | 标签页切换 |
| Breadcrumb | `components/ui/Breadcrumb.tsx` | 面包屑导航 |
| Pagination | `components/ui/Pagination.tsx` | 分页器 |
| Menu | `components/ui/Menu.tsx` | 菜单组件 |
| Dropdown | `components/ui/Dropdown.tsx` | 下拉菜单 |

### 4. 反馈组件 (Feedback Components)

| 组件名称 | 文件路径 | 说明 |
|---------|---------|------|
| Toast | `components/ui/Toast.tsx` | 轻提示 |
| Alert | `components/ui/Alert.tsx` | 警告提示 |
| Dialog | `components/ui/Dialog.tsx` | 确认对话框 |
| Progress | `components/ui/Progress.tsx` | 进度条 |
| Skeleton | `components/ui/Skeleton.tsx` | 骨架屏 |
| Spinner | `components/ui/Spinner.tsx` | 加载动画 |
| Empty | `components/ui/Empty.tsx` | 空状态 |

### 5. 数据展示组件 (Data Display Components)

| 组件名称 | 文件路径 | 说明 |
|---------|---------|------|
| Table | `components/ui/Table.tsx` | 数据表格 |
| List | `components/ui/List.tsx` | 列表组件 |
| Tree | `components/ui/Tree.tsx` | 树形结构 |
| Collapse | `components/ui/Collapse.tsx` | 折叠面板 |
| Tooltip | `components/ui/Tooltip.tsx` | 文字提示 |
| Popover | `components/ui/Popover.tsx` | 气泡卡片 |
| Tag | `components/ui/Tag.tsx` | 标签 |

### 6. 业务组件 (Business Components)

| 组件名称 | 文件路径 | 说明 |
|---------|---------|------|
| ProjectCard | `components/business/ProjectCard.tsx` | 项目卡片 (Bento风格) |
| CharacterCard | `components/business/CharacterCard.tsx` | 角色卡片 |
| SceneCard | `components/business/SceneCard.tsx` | 场景卡片 |
| ShotCard | `components/business/ShotCard.tsx` | 分镜卡片 |
| ScriptEditor | `components/business/ScriptEditor.tsx` | 剧本编辑器 |
| ImageUploader | `components/business/ImageUploader.tsx` | 图片上传 |
| ModelSelector | `components/business/ModelSelector.tsx` | AI模型选择器 |
| StyleSelector | `components/business/StyleSelector.tsx` | 风格选择器 |

### 7. Bento 专用组件 (Bento Components)

| 组件名称 | 文件路径 | 说明 |
|---------|---------|------|
| BentoGrid | `components/bento/BentoGrid.tsx` | Bento 网格容器 |
| BentoCard | `components/bento/BentoCard.tsx` | Bento 卡片基础组件 |
| BentoCardSmall | `components/bento/BentoCardSmall.tsx` | 小型卡片 (1x1) |
| BentoCardMedium | `components/bento/BentoCardMedium.tsx` | 中型卡片 (1x2) |
| BentoCardLarge | `components/bento/BentoCardLarge.tsx` | 大型卡片 (2x2) |
| BentoCardWide | `components/bento/BentoCardWide.tsx` | 宽卡片 (2x1) |
| BentoCardTall | `components/bento/BentoCardTall.tsx` | 高卡片 (1x2) |
| BentoStatsCard | `components/bento/BentoStatsCard.tsx` | 数据统计卡片 |
| BentoActionCard | `components/bento/BentoActionCard.tsx` | 操作入口卡片 |
| BentoImageCard | `components/bento/BentoImageCard.tsx` | 图片展示卡片 |
| BentoGradientCard | `components/bento/BentoGradientCard.tsx` | 渐变背景卡片 |

---

## 📄 页面重构清单

### 设计风格说明

所有页面重构采用 **Bento Grid（苹果风格模块化卡片）** 设计语言：

```
┌─────────────────────────────────────────────────────────────────────┐
│  Bento Grid 设计特点：                                               │
│  • 模块化卡片布局 - 不规则尺寸的圆角卡片组合                           │
│  • 内容密度变化 - 大卡片承载核心信息，小卡片展示辅助信息                 │
│  • 视觉节奏感 - 大小卡片交错排列，创造动态视觉效果                      │
│  • 悬停交互 - 卡片悬停时轻微放大和阴影增强                             │
│  • 苹果风格 - 简洁留白、精致阴影、大圆角                               │
│  • 多彩点缀 - 关键卡片使用渐变背景色突出                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Phase 1: 核心页面 (优先级: P0)

| 页面 | 文件路径 | 重构内容 |
|------|---------|---------|
| 登录页 | `pages/LoginPage.tsx` | Bento 风格登录卡片、渐变背景、入场动画 |
| 注册页 | `pages/RegisterPage.tsx` | 统一登录页风格 |
| 项目列表 | `pages/ProjectsPage.tsx` | Bento Grid 项目卡片布局、筛选器重构 |
| 项目详情 | `pages/ProjectDetailPage.tsx` | Bento 模块化信息展示、标签页布局 |

### Phase 2: 创作页面 (优先级: P0)

| 页面 | 文件路径 | 重构内容 |
|------|---------|---------|
| 剧本编辑 | `pages/ScriptEditorPage.tsx` | Bento 工具栏面板、浮动操作卡片、全屏模式 |
| 角色管理 | `pages/CharactersPage.tsx` | Bento 角色卡片、定妆照画廊、属性编辑 |
| 场景管理 | `pages/ScenesPage.tsx` | Bento 场景卡片、概念图展示、时间线 |
| 分镜管理 | `pages/ShotsPage.tsx` | Bento 分镜网格、关键帧展示、批量操作 |

### Phase 3: 设置页面 (优先级: P1)

| 页面 | 文件路径 | 重构内容 |
|------|---------|---------|
| AI提供商 | `pages/AIProvidersPage.tsx` | Bento 提供商卡片、模型列表、配置表单 |
| 模型配置 | `pages/ModelConfigurationPage.tsx` | Bento 分类标签、参数面板、批量操作 |
| 个人设置 | `pages/ProfilePage.tsx` | Bento 头像卡片、表单布局、安全设置 |
| 外观设置 | `pages/AppearanceSettingsPage.tsx` | Bento 主题预览卡片、颜色选择器 |

### Phase 4: 辅助页面 (优先级: P2)

| 页面 | 文件路径 | 重构内容 |
|------|---------|---------|
| 文档管理 | `pages/DocumentsPage.tsx` | Bento 文档卡片、预览模式 |
| 团队管理 | `pages/TeamPage.tsx` | Bento 成员卡片、权限管理 |
| 分析中心 | `pages/AnalyticsPage.tsx` | Bento 数据卡片、图表组件 |
| 帮助中心 | `pages/HelpPage.tsx` | Bento FAQ卡片、搜索功能 |

### Phase 5: 其他页面 (优先级: P3)

| 页面 | 文件路径 | 重构内容 |
|------|---------|---------|
| 小说管理 | `pages/NovelsPage.tsx` | Bento 小说卡片、编辑器入口 |
| 小说编辑 | `pages/NovelEditorPage.tsx` | Bento 编辑器布局、章节导航 |
| 大纲生成 | `pages/OutlinePage.tsx` | Bento 步骤卡片、结果展示 |
| 故事线 | `pages/StorylinePage.tsx` | Bento 时间线卡片、节点编辑 |
| 视频合成 | `pages/VideoMergePage.tsx` | Bento 时间轴卡片、预览窗口 |
| 图像生成 | `pages/ImageGenerationPage.tsx` | Bento 参数面板、结果画廊 |
| 视频生成 | `pages/VideoGenerationPage.tsx` | Bento 参数面板、进度展示 |

---

## 📅 实施计划

### 阶段一：设计规范与组件库 (Week 1-2)

```
Week 1:
├── Day 1-2: 设计规范文档编写
│   ├── 色彩系统定义
│   ├── 字体系统定义
│   ├── 间距与圆角规范
│   └── 阴影与动效规范
│
├── Day 3-4: 基础组件开发
│   ├── Button 组件 (4种变体)
│   ├── Input 组件 (含验证状态)
│   ├── Card 组件 (玻璃拟态)
│   └── Modal 组件 (动画过渡)
│
└── Day 5: 布局组件开发
    ├── Container 组件
    ├── Stack 组件
    └── Grid 组件

Week 2:
├── Day 1-2: 导航组件开发
│   ├── Navbar 组件
│   ├── Sidebar 组件
│   └── Tabs 组件
│
├── Day 3-4: 反馈组件开发
│   ├── Toast 组件
│   ├── Dialog 组件
│   ├── Skeleton 组件
│   └── Progress 组件
│
└── Day 5: 组件库文档
    ├── Storybook 配置
    └── 组件使用示例
```

### 阶段二：核心页面重构 (Week 3-4)

```
Week 3:
├── Day 1-2: 登录/注册页面
│   ├── 玻璃拟态卡片设计
│   ├── 渐变背景动效
│   ├── 表单验证交互
│   └── 响应式适配
│
├── Day 3-4: 项目列表页面
│   ├── 项目卡片重构
│   ├── 筛选器组件
│   ├── 视图切换 (网格/列表)
│   └── 空状态设计
│
└── Day 5: 项目详情页面
    ├── 标签页布局
    ├── 信息架构优化
    └── 操作按钮组

Week 4:
├── Day 1-2: 剧本编辑页面
│   ├── 编辑器工具栏
│   ├── 浮动操作面板
│   ├── 全屏编辑模式
│   └── AI 功能入口
│
├── Day 3-4: 角色管理页面
│   ├── 角色卡片设计
│   ├── 定妆照画廊
│   ├── 属性编辑表单
│   └── 一致性评分展示
│
└── Day 5: 场景管理页面
    ├── 场景卡片设计
    ├── 概念图展示
    └── 时间线组件
```

### 阶段三：创作页面重构 (Week 5-6)

```
Week 5:
├── Day 1-2: 分镜管理页面
│   ├── 分镜网格布局
│   ├── 关键帧展示
│   ├── 批量操作工具栏
│   └── 拖拽排序功能
│
├── Day 3-4: 图像生成页面
│   ├── 参数面板设计
│   ├── 结果画廊展示
│   ├── 批量生成进度
│   └── 历史记录列表
│
└── Day 5: 视频生成页面
    ├── 参数配置表单
    ├── 生成进度展示
    └── 预览播放器

Week 6:
├── Day 1-2: 小说编辑页面
│   ├── 编辑器布局
│   ├── 章节导航侧栏
│   └── AI 辅助工具
│
├── Day 3-4: 大纲/故事线页面
│   ├── 步骤指示器
│   ├── 时间线组件
│   └── 结果预览卡片
│
└── Day 5: 视频合成页面
    ├── 时间轴组件
    ├── 预览窗口
    └── 导出配置面板
```

### 阶段四：设置与辅助页面 (Week 7-8)

```
Week 7:
├── Day 1-2: AI提供商页面
│   ├── 提供商卡片设计
│   ├── 模型列表展示
│   └── 配置表单优化
│
├── Day 3-4: 模型配置页面
│   ├── 分类标签页
│   ├── 参数配置面板
│   └── 批量操作功能
│
└── Day 5: 个人设置页面
    ├── 头像上传组件
    ├── 表单布局优化
    └── 安全设置区域

Week 8:
├── Day 1-2: 外观设置页面
│   ├── 主题预览卡片
│   ├── 颜色选择器
│   └── 字体大小调节
│
├── Day 3-4: 团队/文档页面
│   ├── 成员列表设计
│   ├── 权限管理界面
│   └── 文档预览模式
│
└── Day 5: 分析中心页面
    ├── 图表组件优化
    ├── 数据卡片设计
    └── 筛选器组件
```

### 阶段五：测试与优化 (Week 9-10)

```
Week 9:
├── Day 1-2: 视觉回归测试
│   ├── 截图对比测试
│   ├── 响应式测试
│   └── 主题切换测试
│
├── Day 3-4: 性能优化
│   ├── 组件懒加载
│   ├── 图片优化
│   ├── CSS 优化
│   └── 动画性能优化
│
└── Day 5: 无障碍测试
    ├── 键盘导航测试
    ├── 屏幕阅读器测试
    └── 颜色对比度测试

Week 10:
├── Day 1-2: Bug 修复
│   ├── 视觉问题修复
│   ├── 交互问题修复
│   └── 兼容性问题修复
│
├── Day 3-4: 文档完善
│   ├── 设计规范文档
│   ├── 组件使用文档
│   └── 开发指南更新
│
└── Day 5: 发布准备
    ├── 版本发布说明
    ├── 变更日志编写
    └── 用户通知准备
```

---

## 👥 资源需求

### 人员配置

| 角色 | 人数 | 职责 |
|------|------|------|
| UI/UX 设计师 | 1 | 设计规范制定、视觉设计、交互设计 |
| 前端开发工程师 | 2 | 组件开发、页面重构、性能优化 |
| 测试工程师 | 1 | 视觉测试、功能测试、兼容性测试 |
| 项目经理 | 1 | 进度管理、资源协调、风险控制 |

### 技术资源

| 资源类型 | 说明 |
|---------|------|
| 设计工具 | Figma (设计协作) |
| 组件文档 | Storybook |
| 图标库 | Lucide Icons |
| 动画库 | Framer Motion |
| 测试工具 | Cypress (E2E)、Jest (单元) |
| CSS 方案 | Tailwind CSS + CSS Variables |

---

## ✅ 质量验收标准

### 视觉质量标准

| 检查项 | 标准 | 验收方法 |
|--------|------|---------|
| 色彩一致性 | 所有页面使用统一的色彩变量 | 代码审查 + 视觉检查 |
| 字体一致性 | 所有页面使用统一的字体层级 | 代码审查 + 视觉检查 |
| 间距一致性 | 所有间距符合 4px 网格规范 | 设计稿对比 |
| 圆角一致性 | 所有圆角使用预定义变量 | 代码审查 |
| 阴影一致性 | 所有阴影使用预定义变量 | 代码审查 |

### 交互质量标准

| 检查项 | 标准 | 验收方法 |
|--------|------|---------|
| Hover 反馈 | 所有可交互元素有视觉反馈 | 手动测试 |
| Focus 状态 | 所有交互元素有清晰的焦点状态 | 键盘导航测试 |
| 加载状态 | 所有异步操作有加载指示 | 手动测试 |
| 错误处理 | 所有错误有友好的提示信息 | 异常场景测试 |
| 过渡动画 | 所有状态变化有平滑过渡 | 手动测试 |

### 性能标准

| 指标 | 目标值 | 测量方法 |
|------|--------|---------|
| 首屏加载时间 | < 2s | Lighthouse |
| 交互响应时间 | < 100ms | Chrome DevTools |
| 动画帧率 | ≥ 60fps | Chrome DevTools |
| Lighthouse 评分 | ≥ 90 | Lighthouse |
| 包体积增量 | < 20% | Webpack Bundle Analyzer |

### 无障碍标准

| 检查项 | 标准 | 验收方法 |
|--------|------|---------|
| 键盘导航 | 所有功能可通过键盘访问 | 键盘测试 |
| 颜色对比度 | 文字对比度 ≥ 4.5:1 | 对比度检测工具 |
| 屏幕阅读器 | 所有元素有正确的 ARIA 标签 | NVDA/VoiceOver 测试 |
| 焦点管理 | 模态框打开时焦点正确捕获 | 手动测试 |

---

## ⚠️ 风险评估与应对

### 技术风险

| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|---------|
| 组件库与现有代码冲突 | 中 | 高 | 渐进式迁移，保留旧组件兼容 |
| 主题切换导致样式混乱 | 中 | 中 | 使用 CSS 变量，统一管理主题 |
| 性能下降 | 低 | 高 | 性能监控，按需加载优化 |
| 浏览器兼容性问题 | 低 | 中 | Polyfill 策略，降级方案 |

### 进度风险

| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|---------|
| 设计规范变更 | 中 | 中 | 冻结设计规范，变更需审批 |
| 人员变动 | 低 | 高 | 文档完善，知识共享 |
| 需求蔓延 | 中 | 中 | 严格范围管理，变更评估 |
| 第三方依赖问题 | 低 | 中 | 备选方案，版本锁定 |

### 质量风险

| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|---------|
| 视觉回归 | 高 | 中 | 截图对比测试，视觉回归工具 |
| 用户体验下降 | 中 | 高 | 用户测试，灰度发布 |
| 无障碍问题 | 中 | 中 | 无障碍审计，自动化检测 |

---

## 📊 项目里程碑

```
┌─────────────────────────────────────────────────────────────────────────┐
│  里程碑                       │  时间点    │  交付物                    │
├─────────────────────────────────────────────────────────────────────────┤
│  M1: 设计规范完成             │  Week 1    │  设计规范文档              │
│  M2: 组件库完成               │  Week 2    │  组件库 + Storybook        │
│  M3: 核心页面重构完成         │  Week 4    │  登录/项目/编辑页面        │
│  M4: 创作页面重构完成         │  Week 6    │  角色/场景/分镜页面        │
│  M5: 设置页面重构完成         │  Week 8    │  设置/团队/分析页面        │
│  M6: 测试与优化完成           │  Week 10   │  测试报告 + 发布准备       │
│  M7: 项目上线                 │  Week 11   │  新版本发布                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 附录

### A. 设计文件清单

```
docs/
├── design-system/
│   ├── colors.md          # 色彩规范
│   ├── typography.md      # 字体规范
│   ├── spacing.md         # 间距规范
│   ├── shadows.md         # 阴影规范
│   ├── animations.md      # 动效规范
│   └── components.md      # 组件规范
│
├── wireframes/            # 线框图
│   ├── login.png
│   ├── projects.png
│   └── ...
│
└── mockups/               # 高保真原型
    ├── login-dark.png
    ├── login-light.png
    └── ...
```

### B. 组件库文件结构

```
apps/web/src/components/
├── ui/                    # 基础组件
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── ...
│
├── layout/                # 布局组件
│   ├── Container.tsx
│   ├── Stack.tsx
│   └── Grid.tsx
│
├── navigation/            # 导航组件
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── Tabs.tsx
│
├── feedback/              # 反馈组件
│   ├── Toast.tsx
│   ├── Dialog.tsx
│   └── Progress.tsx
│
├── bento/                 # Bento 专用组件 ⭐
│   ├── BentoGrid.tsx
│   ├── BentoCard.tsx
│   ├── BentoCardSmall.tsx
│   ├── BentoCardMedium.tsx
│   ├── BentoCardLarge.tsx
│   ├── BentoCardWide.tsx
│   ├── BentoCardTall.tsx
│   ├── BentoStatsCard.tsx
│   ├── BentoActionCard.tsx
│   ├── BentoImageCard.tsx
│   └── BentoGradientCard.tsx
│
└── business/              # 业务组件
    ├── ProjectCard.tsx
    ├── CharacterCard.tsx
    └── ...
```

### C. 参考资源

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design 3](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

**文档版本:** 1.0  
**创建日期:** 2026-02-25  
**最后更新:** 2026-02-25  
**负责人:** UI/UX Team
