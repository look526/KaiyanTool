# Tasks: enhance-light-mode

## Phase 1: Audit (发现所有硬编码颜色)

### 1.1 识别硬编码颜色
- [x] 使用 Grep 搜索 `ScriptEditorPage.tsx` 中的硬编码颜色
- [x] 检查其他页面是否存在类似问题
- [x] 创建硬编码颜色清单

### 1.2 检查 Monaco 编辑器主题
- [x] 检查 Monaco 编辑器当前主题配置
- [x] 确认浅色主题支持状态

---

## Phase 2: Replace Hardcoded Colors (替换硬编码颜色)

### 2.1 ScriptEditorPage.tsx
- [x] 替换背景色 (`#070d1f`, `#0c1326`, `#1c253e`, `#000000`) → CSS 变量
- [x] 替换文本色 (`#dfe4fe`, `#a5aac2`, `#6f758b`, `#ba9eff`, `#ec63ff`, `#34b5fa`) → CSS 变量
- [x] 替换边框色 (`rgba(255, 255, 255, 0.1)`, `rgba(65, 71, 91, 0.3)` 等) → CSS 变量
- [x] 替换渐变色 (`linear-gradient(135deg, #ba9eff 0%, #8455ef 100%)`) → CSS 变量
- [x] 添加 `useTheme()` hook 调用
- [x] 验证浅色模式视觉效果

### 2.2 其他页面检查
- [ ] 检查 `ProjectDetailPage.tsx`
- [ ] 检查 `WorkspacePage.tsx`
- [ ] 检查其他可能存在硬编码的页面

---

## Phase 3: Monaco Editor Theme (Monaco 编辑器主题)

### 3.1 Monaco 主题配置
- [x] 在 `MonacoEditor` 组件中添加浅色主题支持
- [x] 根据 `resolvedTheme` 动态切换 `vs-dark` / `vs-light`
- [ ] 测试深色/浅色模式切换

---

## Phase 4: Verification (验证)

### 4.1 功能测试
- [ ] 切换到浅色模式，检查 `ScriptEditorPage` 视觉效果
- [ ] 切换到深色模式，检查视觉效果
- [ ] 刷新页面，确认主题保持
- [ ] 测试 Monaco 编辑器主题切换

### 4.2 TypeScript 检查
- [x] 运行 `npx tsc --noEmit` 确保无新增错误（无新增错误，预存错误除外）

---

## Dependencies

- Phase 2 依赖 Phase 1 的审计结果
- Phase 3 可与 Phase 2 并行执行
- Phase 4 依赖 Phase 2 和 Phase 3 完成

## Notes

- 使用 `ui-refactor` skill 进行页面重构
- 确保替换时保持 "The Digital Curator" 设计语言
- 避免引入新的硬编码颜色
- `ScriptEditorPage.tsx` 已完成浅色模式支持
- 其他页面（ProjectDetailPage、WorkspacePage）待后续处理
