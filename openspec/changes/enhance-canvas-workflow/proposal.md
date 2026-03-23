# Change: 增强画布工作台功能

## Why

当前画布工作台已实现基础功能（节点创建、连线、拖拽），但缺少关键的用户体验功能和 AI 能力扩展：

1. **AI 生成不可用**：右键菜单只是创建空节点，没有实际调用 AI 服务
2. **缺少配置面板**：无法编辑节点参数（如文字内容、AI 模型选择）
3. **操作安全性低**：没有撤销/重做，误操作无法恢复
4. **画布导航困难**：大画布下无法快速定位
5. **数据可移植性差**：无法导出/导入工作流

需要增强工作台的核心功能和 AI 集成能力。

## What Changes

### 1. 节点配置面板
- 新增**选中节点后的右侧属性面板**
- 支持编辑文字内容、选择 AI 模型、调整生成参数

### 2. 键盘快捷键
| 快捷键 | 功能 |
|--------|------|
| `Delete` | 删除选中节点 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+S` | 保存 |
| `Ctrl+A` | 全选 |
| `Space` + 拖拽 | 平移画布 |

### 3. 历史记录（撤销/重做）
- 操作历史栈（最多 50 步）
- 支持撤销和重做

### 4. AI 生成进度可视化
- 节点显示加载动画（骨架屏）
- 实时显示生成进度
- 失败时显示重试按钮

### 5. 画布导航优化
- 右下角 **Mini-map** 缩略图导航
- **框选多选**功能
- 快速添加文字节点（双击空白）

### 6. 导出/导入功能
- 导出工作流为 JSON 配置
- 导入之前保存的工作流
- 支持工作流模板保存

### 7. 节点历史版本
- 每个节点保留生成历史
- 支持回退到之前版本

### 8. 节点标记功能
- 星标收藏
- 颜色标签分类

## Impact

- Affected specs: `canvas-workflow-enhancement`(新)
- Affected code:
  - `apps/web/src/pages/WorkspacePage.tsx` — 大幅重构
  - `apps/web/src/components/workspace/NodeConfigPanel.tsx` — 新建配置面板
  - `apps/web/src/components/workspace/MiniMap.tsx` — 新建缩略图
  - `apps/api/prisma/schema.prisma` — 扩展 CanvasNode 模型（history、labels）
  - `apps/api/src/services/workspace.service.ts` — 新增历史版本、导出/导入 API

## 依赖关系

```
节点配置面板 ──→ AI 生成进度可视化 ──→ 历史版本（可并行）
撤销/重做 ──→ 键盘快捷键（可并行）
Mini-map ──→ 框选多选（可并行）
导出/导入 ──→ 模板功能（可并行）
```