# Change: UI页面重构

## Why
当前项目存在以下UI问题:
1. 页面样式不一致，缺乏统一设计语言
2. 存在大量内联样式和硬编码颜色值
3. 主题切换(亮色/暗色)可能不生效
4. 交互状态(悬停/点击)反馈不明确

## What Changes
- 使用 ui-refactor skill 规范化重构流程
- 使用 design-system/tokens 定义的设计令牌
- 遵循 CSS变量体系,替换硬编码颜色
- 实现悬停/点击交互状态
- 确保亮色/暗色主题兼容

## Impact
- 影响范围: apps/web/src/pages/ 下所有页面
- 核心文件: 
  - design-system/tokens/ (已创建)
  - design-system/components/Button/ (已创建)
  - 60+ 个页面文件待重构

## 分阶段实施
1. **Phase 1**: 核心页面重构 (ProjectsPage, HomePage, LoginPage)
2. **Phase 2**: 功能页面重构 (Editor, Settings, Admin)
3. **Phase 3**: 剩余页面和组件库完善
