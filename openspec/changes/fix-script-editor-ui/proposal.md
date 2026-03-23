# Change: 修复剧本编辑器页面UI问题

## Why

剧本编辑器页面 (ScriptEditorPage) 存在以下用户体验问题:

1. **模型选择器显示"未找到匹配的模型"**
   - 用户没有配置AI模型时,选择器显示空状态不够友好
   - 缺少引导用户去配置模型的入口

2. **下滑时显示白色背景**
   - 内容区域滚动时背景不连续
   - 根容器 `overflow: hidden` 配合子元素高度问题导致

3. **可以往右滑动显示白色**
   - 页面缺少 `overflow-x: hidden`
   - 某些子元素宽度超出容器

4. **整体交互体验待优化**
   - 侧边栏悬浮效果不够明显
   - AI工具面板展开/收起动画不流畅

## What Changes

1. **页面基础样式修复**
   - 修复页面背景和溢出问题
   - 确保深色/浅色模式背景一致性

2. **模型选择器空状态优化**
   - 添加友好的空状态提示
   - 提供"管理模型"快捷入口
   - 引导用户前往 AI Providers 页面配置

3. **滚动和溢出行为修复**
   - 修复下滑显示白色背景问题
   - 禁止右滑显示白色
   - 确保编辑器区域滚动流畅

4. **交互体验微调**
   - 优化侧边栏悬浮反馈
   - 改善AI工具面板动画

## Impact

- 影响文件: `apps/web/src/pages/ScriptEditorPage.tsx`
- 影响组件: `apps/web/src/components/ui/ModelSelector/`
- 依赖: 需要用户已配置 AI Provider 和模型数据

## Out of Scope

- 不修改剧本编辑器的核心功能逻辑
- 不修改 Monaco Editor 配置
- 不修改后端 API 逻辑

## Related Changes

- `refactor-ui-pages`: 页面重构基础规范
- `enhance-light-mode`: 亮色模式支持