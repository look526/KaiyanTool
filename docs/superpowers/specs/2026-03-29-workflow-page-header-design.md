# Workflow 页面 Header 统一设计规范 (v2)

## 1. 设计目标

统一 workflow sidebar 页面（故事线、角色、场景、物品）的 header 风格为超紧凑版 CompactPageHero，与 dashboard 其他页面保持一致的设计语言。

## 2. 设计原则

### 超紧凑设计
- 页面 header 总高度约 48-56px
- 不使用占空间的装饰性光晕背景
- 标题与按钮同行对齐
- 统计信息融合到副标题中

### 动画保留
- 页面进入动画
- 数字滚动效果（可选）
- 悬浮交互反馈

## 3. 紧凑版 CompactPageHero 组件

### 布局结构
```
┌──────────────────────────────────────────────────────────────┐
│  📖 STORYLINE                              [+ 生成故事线]    │
│  故事线生成 · 5个角色 · 2个大纲                            │
└──────────────────────────────────────────────────────────────┘
```

### Props 接口
```typescript
interface CompactPageHeroProps {
  title: string;           // 大写英文标题 "STORYLINE"
  subtitle?: string;       // 中文副标题基础部分
  icon: React.ReactNode;  // 图标元素
  stats?: { label: string; value: number }[]; // 统计项，融合到副标题
  actions?: React.ReactNode; // 右侧操作按钮
}
```

### 样式规范

**布局**：
- 整体高度：48-56px
- 内边距：0 水平，0 垂直
- 标题区：左对齐，flex 行
- 操作区：右侧 absolute 定位

**图标**：
- 尺寸：32px × 32px
- 圆角：8px
- 渐变背景
- 无动画（简洁为主）

**标题**：
- 标题：12px，font-weight 600，letter-spacing 0.15em，大写
- 副标题：12px，颜色 textMuted，"基础副标题 · 统计1 · 统计2"

**动画规范**：

| 动画 | 属性 | 时长 | 缓动 |
|------|------|------|------|
| 页面进入 | opacity 0→1 | 200ms | ease-out |
| 按钮悬浮 | scale 1→1.02 | 150ms | ease |
| 整体悬浮 | 无（避免干扰）| - | - |

## 4. 页面配置

| 页面 | 标题 | 副标题基础 | 统计项 |
|------|------|-----------|--------|
| StorylinePage | STORYLINE | 故事线生成 | 剧本数、角色数、大纲数 |
| CharactersPage | CHARACTERS | 角色管理 | 角色总数 |
| ScenesPage | SCENES | 场景管理 | 场景总数、镜头数 |
| ItemsPage | ITEMS | 物品管理 | 物品总数 |

## 5. 深色/浅色模式

使用与 dashboard 其他页面相同的颜色系统。

## 6. 验收标准

- [ ] 超紧凑版 CompactPageHero 组件创建完成
- [ ] 页面进入动画流畅
- [ ] 悬浮交互正常
- [ ] 深色/浅色模式正常
- [ ] StorylinePage 重构完成
- [ ] CharactersPage 重构完成
- [ ] ScenesPage 重构完成
- [ ] ItemsPage 重构完成
- [ ] TypeScript 编译通过
