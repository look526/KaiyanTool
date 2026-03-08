# UI页面重构任务清单

## 实施顺序

### Phase 1: 核心页面 (用户入口)
- [x] 1.1 重构 HomePage.tsx - 首页/登录页 (黑色 premium 风格)
- [x] 1.2 重构 LoginPage.tsx - 登录页 (黑白 flat 风格)
- [x] 1.3 重构 RegisterPage.tsx - 注册页 (黑白 flat 风格)
- [x] 1.4 重构 ProjectsPage.tsx - 项目列表页 (已现代化)
- [x] 1.5 重构 ProjectDetailPage.tsx - 项目详情页 (已现代化)
- [x] 1.6 重构 CreateProjectPage.tsx - 创建项目页 (已现代化)
- [x] 1.7 重构 SettingsPage.tsx - 设置页 (已现代化)

### Phase 2: 功能编辑页面
- [ ] 2.1 重构 ScriptEditorPage.tsx - 脚本编辑页
- [ ] 2.2 重构 UnifiedEditorPage.tsx - 统一编辑器
- [ ] 2.3 重构 NovelEditorPage.tsx - 小说编辑页
- [ ] 2.4 重构 ScenesPage.tsx - 场景页面
- [ ] 2.5 重构 CharactersPage.tsx - 角色页面
- [ ] 2.6 重构 ShotsPage.tsx - 分镜页面

### Phase 3: 设置和管理页面
- [ ] 3.1 重构 ProfilePage.tsx - 个人资料页
- [ ] 3.2 重构 AIProvidersPage.tsx - AI提供商页
- [ ] 3.3 重构 SecuritySettingsPage.tsx - 安全设置页
- [ ] 3.4 重构 ProjectMembersPage.tsx - 项目成员页
- [ ] 3.5 重构 NotificationSettingsPage.tsx - 通知设置页
- [ ] 3.6 重构 AppearanceSettingsPage.tsx - 外观设置页

### Phase 4: 辅助功能页面
- [ ] 4.1 重构 AssetsPage.tsx - 资源页面
- [ ] 4.2 重构 DocumentsPage.tsx - 文档页面
- [ ] 4.3 重构 NovelsPage.tsx - 小说页面
- [ ] 4.4 重构 AnalyticsPage.tsx - 分析页面
- [ ] 4.5 重构 ImageGenerationPage.tsx - 图像生成页
- [ ] 4.6 重构 VideoGenerationPage.tsx - 视频生成页

### Phase 5: 管理后台
- [ ] 5.1 重构 AdminLoginPage.tsx - 管理员登录页
- [ ] 5.2 重构 AdminUsersPage.tsx - 用户管理页
- [ ] 5.3 重构 AdminLogsPage.tsx - 日志页面
- [ ] 5.4 重构 AdminAssetsPage.tsx - 资源管理页

## 重构验收标准
每个页面重构完成后需验证:
- [ ] 使用 CSS 变量而非硬编码颜色
- [ ] 亮色模式下视觉正确
- [ ] 暗色模式下视觉正确
- [ ] 悬停/点击交互有反馈
- [ ] 无TypeScript类型错误
- [ ] 无硬编码颜色值
- [ ] 使用 button-new 组件替代旧 Button

## 设计风格
统一采用黑白 flat premium 风格:
- 纯黑背景 (#000000) 或纯白背景 (#ffffff)
- 紫色强调色 (#6366f1)
- 简洁的圆角和边框
- 微妙的阴影和动画
