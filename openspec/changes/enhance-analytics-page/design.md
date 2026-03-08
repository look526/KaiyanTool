## Context
Analytics 页面是用户查看项目数据和使用统计的核心页面。当前页面功能基础，缺乏数据交互能力和可视化效果。本次增强旨在提升用户体验，使数据更易于理解和操作。

## Goals / Non-Goals

### Goals
- 提供灵活的时间范围选择，支持用户按需查看数据
- 增强数据可视化效果，使用专业图表库
- 提供环比数据对比，帮助用户发现趋势
- 支持数据导出，便于汇报和存档
- 提供异常告警，及时发现模型问题

### Non-Goals
- 不涉及后端数据结构变更
- 不实现实时数据推送（WebSocket）
- 不实现数据下钻详情页
- 不实现团队对比功能

## Decisions

### 1. 图表库选择
- **Decision**: 使用 Recharts 作为图表库
- **Rationale**: 
  - 基于 React，与项目技术栈一致
  - 声明式 API，易于使用
  - 支持响应式和主题适配
  - 社区活跃，文档完善
- **Alternatives considered**: 
  - Chart.js: 需要额外 React 封装
  - D3.js: 学习曲线陡峭，过度复杂

### 2. 时间范围实现
- **Decision**: 前端状态管理 + API 参数传递
- **Rationale**: 
  - 后端已有时间范围查询能力
  - 前端状态管理简单直接
  - 避免复杂的状态同步

### 3. 环比数据计算
- **Decision**: 前端计算环比变化
- **Rationale**: 
  - 减少后端 API 变更
  - 数据量小，前端计算性能足够
  - 灵活支持不同时间范围对比

### 4. 数据导出格式
- **Decision**: 仅支持 CSV 格式
- **Rationale**: 
  - CSV 格式通用性强
  - 实现简单
  - 可用 Excel 打开
- **Alternatives considered**: 
  - PDF: 需要额外库，实现复杂
  - Excel: 需要专用库

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Recharts 包体积较大 | 使用 tree-shaking，仅导入需要的组件 |
| 图表在移动端显示不佳 | 响应式设计，小屏幕隐藏部分功能 |
| 环比数据计算可能不准确 | 使用相同时间跨度对比，显示清晰的时间范围 |

## Component Architecture

```
AnalyticsPage.tsx
├── AnalyticsHeader (新增)
│   ├── TimeRangeSelector
│   ├── RefreshButton
│   └── ExportButton
├── StatCard (增强)
│   ├── 环比变化指示
│   └── MiniTrendChart
├── TrendChart (新增 - Recharts)
│   ├── AreaChart
│   └── Tooltip
├── ModelUsageCard (增强)
│   └── HealthIndicator
└── InsightCard (新增)
    └── 数据洞察内容
```

## Open Questions
- 是否需要支持自定义时间范围选择？（暂不实现，后续迭代）
- 是否需要添加数据对比功能？（暂不实现，后续迭代）
