# Tasks: refactor-ui-bento-grid

## Phase 1: 设计规范与组件库 (Week 1-2)

### 1.1 设计规范文档
- [x] 创建设计规范文档 `docs/design-system/`
- [x] 定义色彩系统（苹果蓝 #007AFF + 多彩辅助色）
- [x] 定义字体系统（Inter + JetBrains Mono）
- [x] 定义间距与圆角规范（16px-24px 大圆角）
- [x] 定义阴影与动效规范

### 1.2 Bento 基础组件开发
- [x] 创建 `components/bento/BentoGrid.tsx` - Bento 网格容器
- [x] 创建 `components/bento/BentoCard.tsx` - Bento 卡片基础组件
- [x] 创建 `components/bento/BentoCardSmall.tsx` - 小型卡片 (1x1)
- [x] 创建 `components/bento/BentoCardMedium.tsx` - 中型卡片 (1x2)
- [x] 创建 `components/bento/BentoCardLarge.tsx` - 大型卡片 (2x2)
- [x] 创建 `components/bento/BentoCardWide.tsx` - 宽卡片 (2x1)
- [x] 创建 `components/bento/BentoCardTall.tsx` - 高卡片 (1x2)

### 1.3 Bento 业务组件开发
- [x] 创建 `components/bento/BentoStatsCard.tsx` - 数据统计卡片
- [x] 创建 `components/bento/BentoActionCard.tsx` - 操作入口卡片
- [x] 创建 `components/bento/BentoImageCard.tsx` - 图片展示卡片
- [x] 创建 `components/bento/BentoGradientCard.tsx` - 渐变背景卡片

### 1.4 基础 UI 组件更新
- [x] 更新 `components/ui/Button.tsx` - 苹果风格按钮
- [x] 更新 `components/ui/Input.tsx` - 苹果风格输入框
- [x] 更新 `components/ui/Card.tsx` - Bento 风格卡片
- [x] 更新 `components/ui/Modal.tsx` - 动画过渡优化

### 1.5 导航组件更新
- [x] 更新 `components/ui/Navbar.tsx` - 苹果风格导航栏
- [x] 更新 `components/ui/Sidebar.tsx` - Bento 风格侧边栏
- [x] 更新 `components/ui/Tabs.tsx` - 苹果风格标签页

### 1.6 反馈组件更新
- [x] 更新 `components/ui/Toast.tsx` - Bento 风格提示
- [x] 更新 `components/ui/Dialog.tsx` - 动画优化
- [x] 创建 `components/ui/Skeleton.tsx` - 骨架屏
- [x] 更新 `components/ui/Progress.tsx` - 苹果风格进度条

## Phase 2: 核心页面重构 (Week 3-4)

### 2.1 登录/注册页面
- [ ] 重构 `pages/LoginPage.tsx` - Bento 风格登录卡片
- [ ] 重构 `pages/RegisterPage.tsx` - 统一登录页风格
- [ ] 添加入场动画效果
- [ ] 优化表单验证交互

### 2.2 项目列表页面
- [ ] 重构 `pages/ProjectsPage.tsx` - Bento Grid 项目卡片布局
- [ ] 创建 `components/business/ProjectCard.tsx` - Bento 项目卡片
- [ ] 重构筛选器组件
- [ ] 添加视图切换（网格/列表）

### 2.3 项目详情页面
- [ ] 重构 `pages/ProjectDetailPage.tsx` - Bento 模块化信息展示
- [ ] 优化标签页布局
- [ ] 重构信息架构

### 2.4 剧本编辑页面
- [ ] 重构 `pages/ScriptEditorPage.tsx` - Bento 工具栏面板
- [ ] 重构浮动操作卡片
- [ ] 优化全屏编辑模式
- [ ] 重构 AI 功能入口

## Phase 3: 创作页面重构 (Week 5-6)

### 3.1 角色管理页面
- [ ] 重构 `pages/CharactersPage.tsx` - Bento 角色卡片
- [ ] 创建 `components/business/CharacterCard.tsx`
- [ ] 重构定妆照画廊
- [ ] 优化属性编辑表单

### 3.2 场景管理页面
- [ ] 重构 `pages/ScenesPage.tsx` - Bento 场景卡片
- [ ] 创建 `components/business/SceneCard.tsx`
- [ ] 重构概念图展示
- [ ] 优化时间线组件

### 3.3 分镜管理页面
- [ ] 重构 `pages/ShotsPage.tsx` - Bento 分镜网格
- [ ] 创建 `components/business/ShotCard.tsx`
- [ ] 重构关键帧展示
- [ ] 优化批量操作工具栏

### 3.4 图像/视频生成页面
- [ ] 重构 `pages/ImageGenerationPage.tsx` - Bento 参数面板
- [ ] 重构 `pages/VideoGenerationPage.tsx`
- [ ] 重构结果画廊展示
- [ ] 优化生成进度展示

## Phase 4: 设置与辅助页面 (Week 7-8)

### 4.1 AI 提供商页面
- [ ] 重构 `pages/AIProvidersPage.tsx` - Bento 提供商卡片
- [ ] 重构模型列表展示
- [ ] 优化配置表单

### 4.2 模型配置页面
- [ ] 重构 `pages/ModelConfigurationPage.tsx` - Bento 分类标签
- [ ] 重构参数配置面板
- [ ] 优化批量操作功能

### 4.3 个人设置页面
- [ ] 重构 `pages/ProfilePage.tsx` - Bento 头像卡片
- [ ] 优化表单布局
- [ ] 重构安全设置区域

### 4.4 外观设置页面
- [ ] 重构 `pages/AppearanceSettingsPage.tsx` - Bento 主题预览卡片
- [ ] 创建主题预览组件
- [ ] 优化颜色选择器

### 4.5 团队/文档页面
- [ ] 重构 `pages/TeamPage.tsx` - Bento 成员卡片
- [ ] 重构 `pages/DocumentsPage.tsx` - Bento 文档卡片
- [ ] 优化权限管理界面

### 4.6 分析中心页面
- [ ] 重构 `pages/AnalyticsPage.tsx` - Bento 数据卡片
- [ ] 重构图表组件
- [ ] 优化筛选器组件

## Phase 5: 其他页面 (Week 9)

### 5.1 小说相关页面
- [ ] 重构 `pages/NovelsPage.tsx` - Bento 小说卡片
- [ ] 重构 `pages/NovelEditorPage.tsx` - Bento 编辑器布局

### 5.2 其他功能页面
- [ ] 重构 `pages/OutlinePage.tsx` - Bento 步骤卡片
- [ ] 重构 `pages/StorylinePage.tsx` - Bento 时间线卡片
- [ ] 重构 `pages/VideoMergePage.tsx` - Bento 时间轴卡片

## Phase 6: 测试与优化 (Week 10)

### 6.1 视觉测试
- [ ] 执行视觉回归测试
- [ ] 执行响应式测试
- [ ] 执行主题切换测试

### 6.2 性能优化
- [ ] 组件懒加载优化
- [ ] 图片优化
- [ ] CSS 优化
- [ ] 动画性能优化

### 6.3 无障碍测试
- [ ] 键盘导航测试
- [ ] 屏幕阅读器测试
- [ ] 颜色对比度测试

### 6.4 文档完善
- [ ] 更新设计规范文档
- [ ] 更新组件使用文档
- [ ] 更新开发指南

## Validation

- [ ] 所有页面使用统一的 Bento Grid 设计语言
- [ ] Lighthouse 评分 ≥ 90
- [ ] 首屏加载时间 < 2s
- [ ] 所有交互元素有视觉反馈
- [ ] 键盘导航可用
- [ ] 颜色对比度 ≥ 4.5:1
