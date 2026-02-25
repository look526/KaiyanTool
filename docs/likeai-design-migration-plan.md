# LIKE AI.pro 优秀设计移植计划

## 一、项目目标

将LIKE AI.pro的优秀设计理念和用户体验移植到KaiyanTool项目，提升产品的专业度、易用性和竞争力。

## 二、LIKE AI.pro核心设计元素分析

### 2.1 视觉设计

#### 色彩系统
- **主色调**：深色背景 + 强调色（紫色/蓝色渐变）
- **辅助色**：中性灰度色系
- **状态色**：成功绿、警告黄、错误红
- **透明度**：适度使用半透明背景，营造层次感

#### 排版系统
- **间距规范**：8px/16px/24px/32px 倍数关系
- **字体系统**：层级清晰（标题16-32px，正文14-15px，辅助12-13px）
- **圆角规范**：8px/12px/16px 统一圆角
- **阴影系统**：多层次阴影营造深度

#### 动画效果
- **过渡动画**：0.2s-0.3s ease-out
- **悬停效果**：轻微位移（-2px）+ 阴影增强
- **加载动画**：骨架屏 + 渐进式加载

### 2.2 交互设计

#### 导航设计
- **左侧固定导航**：7大模块清晰分类
- **面包屑导航**：层级路径清晰
- **快捷操作**：常用功能一键访问

#### 表单设计
- **分组布局**：相关字段分组展示
- **即时反馈**：输入验证实时提示
- **视觉引导**：图标 + 标签 + 占位符
- **进度指示**：多步骤流程清晰展示

#### 卡片设计
- **统一风格**：圆角 + 阴影 + 边框
- **悬停反馈**：边框高亮 + 阴影增强
- **信息层次**：标题 + 描述 + 标签

### 2.3 功能设计

#### 项目创建流程
```
1. 选择项目模板（可选）
2. 填写基本信息
3. 选择视频比例（16:9 / 9:16）
4. 选择风格预设（9种 + 自定义）
5. 创建项目
```

#### 风格选择器
- **网格布局**：3列展示（移动端2列）
- **视觉卡片**：风格名称 + 描述 + 预览
- **选中状态**：边框高亮 + 背景填充
- **详细信息**：推荐用途 + 色板展示

#### 资源管理
- **角色管理**：形象 + 性格 + 服装 + 三视图
- **物品管理**：道具 + 服装 + 配饰 + 分类
- **场景管理**：地点 + 时间 + 氛围 + 参考图
- **关联机制**：资源与分镜关联，支持复用

## 三、移植方案

### 阶段一：基础设计系统（1周）

#### 3.1 设计系统重构

**文件**：`apps/web/src/styles/design-system.css`

```css
:root {
  /* 色彩系统 */
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-primary-light: #818cf8;
  --color-secondary: #8b5cf6;
  --color-secondary-light: #a78bfa;
  --color-accent: #b593f7;
  --color-accent-hover: #9333ea;

  /* 状态色 */
  --color-success: #10b981;
  --color-success-light: #34d399;
  --color-warning: #f59e0b;
  --color-warning-light: #fbbf24;
  --color-error: #ef4444;
  --color-error-light: #f87171;

  /* 中性色 - 深色模式 */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-hover: #475569;
  --bg-active: #64748b;

  /* 文本色 - 深色模式 */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  --text-muted: #475569;

  /* 边框色 */
  --border-primary: #334155;
  --border-secondary: #475569;
  --border-hover: #64748b;
  --border-accent: #b593f7;

  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* 圆角系统 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* 阴影系统 */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 16px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 32px rgba(0, 0, 0, 0.15);

  /* 动画 */
  --transition-fast: 0.15s ease-out;
  --transition-base: 0.2s ease-out;
  --transition-slow: 0.3s ease-out;

  /* 渐变 */
  --gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  --gradient-accent: linear-gradient(135deg, #b593f7 0%, #9333ea 100%);
  --gradient-success: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}
```

#### 3.2 组件样式统一

**文件**：`apps/web/src/components/ui/`

创建/更新以下组件：
- `Card.tsx` - 统一卡片样式
- `Button.tsx` - 统一按钮样式
- `Input.tsx` - 统一输入框样式
- `Select.tsx` - 统一下拉选择样式
- `Badge.tsx` - 统一标签样式

**示例 - Card组件**
```tsx
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-slate-700",
        "bg-slate-800/50 backdrop-blur-sm",
        "hover:border-slate-600 transition-all duration-200",
        "shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
```

### 阶段二：项目创建页面优化（3天）

#### 3.3 视频比例选择器

**文件**：`apps/web/src/components/ui/AspectRatioSelector.tsx`

```tsx
interface AspectRatioSelectorProps {
  value: '16:9' | '9:16';
  onChange: (value: '16:9' | '9:16') => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => onChange('16:9')}
        className={cn(
          "flex-1 flex items-center justify-center gap-2",
          "p-4 rounded-xl border-2",
          "transition-all duration-200",
          value === '16:9'
            ? "border-accent bg-accent text-white"
            : "border-slate-700 bg-transparent text-slate-300",
          "hover:border-accent hover:bg-accent/10"
        )}
      >
        <Monitor className="w-5 h-5" />
        <span className="font-semibold">16:9</span>
      </button>
      <button
        onClick={() => onChange('9:16')}
        className={cn(
          "flex-1 flex items-center justify-center gap-2",
          "p-4 rounded-xl border-2",
          "transition-all duration-200",
          value === '9:16'
            ? "border-accent bg-accent text-white"
            : "border-slate-700 bg-transparent text-slate-300",
          "hover:border-accent hover:bg-accent/10"
        )}
      >
        <Smartphone className="w-5 h-5" />
        <span className="font-semibold">9:16</span>
      </button>
    </div>
  );
}
```

#### 3.4 风格选择器

**文件**：`apps/web/src/components/ui/StyleSelector.tsx`

```tsx
interface StyleSelectorProps {
  value: string;
  onChange: (styleId: string) => void;
}

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STYLE_PRESETS.map((style) => (
        <button
          key={style.id}
          onClick={() => onChange(style.id)}
          className={cn(
            "p-4 rounded-xl border-2 text-left",
            "transition-all duration-200",
            value === style.id
              ? "border-accent bg-accent text-white"
              : "border-slate-700 bg-transparent text-slate-300",
            "hover:border-accent hover:bg-accent/10"
          )}
        >
          <div className="text-sm font-semibold mb-1">
            {style.name}
          </div>
          <div className="text-xs opacity-80">
            {style.description.substring(0, 20)}...
          </div>
        </button>
      ))}
    </div>
  );
}
```

#### 3.5 风格详情卡片

**文件**：`apps/web/src/components/ui/StyleDetailCard.tsx`

```tsx
interface StyleDetailCardProps {
  style: StylePreset;
}

export function StyleDetailCard({ style }: StyleDetailCardProps) {
  if (style.id === 'custom') return null;

  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="text-sm font-semibold text-slate-200 mb-2">
        推荐用于：{style.recommendedFor.join('、')}
      </div>
      <div className="flex gap-2 flex-wrap">
        {style.colorPalette?.map((color, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded border border-slate-600"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
```

### 阶段三：左侧导航优化（2天）

#### 3.6 导航结构重构

**文件**：`apps/web/src/components/Sidebar.tsx`

```tsx
const NAVIGATION_ITEMS = [
  {
    id: 'projects',
    icon: Folder,
    label: '项目',
    description: '管理所有项目'
  },
  {
    id: 'characters',
    icon: Users,
    label: '角色',
    description: '管理角色和服装'
  },
  {
    id: 'items',
    icon: Package,
    label: '物品',
    description: '管理道具和配饰'
  },
  {
    id: 'scenes',
    icon: Image,
    label: '场景',
    description: '管理场景和地点'
  },
  {
    id: 'shots',
    icon: Film,
    label: '分镜',
    description: '管理镜头和分镜'
  },
  {
    id: 'team',
    icon: Users2,
    label: '团队',
    description: '管理团队成员'
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: '数据',
    description: '查看项目数据'
  }
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('projects');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (path) setActiveItem(path);
  }, [location]);

  return (
    <aside className="w-64 border-r border-slate-700 bg-slate-900/50">
      <div className="p-4">
        <h2 className="text-lg font-bold text-slate-200 mb-6">
          工作台
        </h2>
      </div>
      <nav className="px-2">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(`/${item.id}`)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3",
              "rounded-lg mb-1 transition-all duration-200",
              activeItem === item.id
                ? "bg-accent text-white shadow-lg"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
            title={item.description}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
```

### 阶段四：物品管理模块（1周）

#### 3.7 物品管理页面

**文件**：`apps/web/src/pages/ItemsPage.tsx`

```tsx
export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const ITEM_TYPES = [
    { id: 'all', label: '全部' },
    { id: 'prop', label: '道具' },
    { id: 'clothing', label: '服装' },
    { id: 'accessory', label: '配饰' }
  ];

  const filteredItems = items.filter(item => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          物品管理
        </h1>
        <p className="text-slate-400">
          管理项目中的道具、服装和配饰
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="搜索物品..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建物品
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {ITEM_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={cn(
              "px-4 py-2 rounded-lg border-2",
              "transition-all duration-200",
              selectedType === type.id
                ? "border-accent bg-accent text-white"
                : "border-slate-700 bg-transparent text-slate-400",
              "hover:border-accent hover:bg-accent/10"
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

#### 3.8 物品卡片组件

**文件**：`apps/web/src/components/item/ItemCard.tsx`

```tsx
interface ItemCardProps {
  item: Item;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  return (
    <Card className="group relative overflow-hidden">
      {item.image && (
        <div className="aspect-video bg-slate-800">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-100">
            {item.name}
          </h3>
          <Badge variant="secondary">
            {item.type}
          </Badge>
        </div>
        {item.description && (
          <p className="text-sm text-slate-400 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(item)}
            className="flex-1"
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(item)}
            className="text-red-400 hover:text-red-300"
          >
            删除
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### 阶段五：数据分析看板（1周）

#### 3.9 数据分析页面

**文件**：`apps/web/src/pages/AnalyticsPage.tsx`

```tsx
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          数据分析
        </h1>
        <p className="text-slate-400">
          查看项目进度和资源使用情况
        </p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-sm text-slate-400 mb-2">
              项目进度
            </div>
            <div className="text-3xl font-bold text-slate-100 mb-2">
              {analytics.progress.percentage}%
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${analytics.progress.percentage}%` }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-slate-400 mb-2">
              分镜数量
            </div>
            <div className="text-3xl font-bold text-slate-100">
              {analytics.shotCount}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-slate-400 mb-2">
              资源使用
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">角色</span>
                <span className="text-slate-200 font-semibold">
                  {analytics.resourceUsage.characters}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">场景</span>
                <span className="text-slate-200 font-semibold">
                  {analytics.resourceUsage.scenes}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">物品</span>
                <span className="text-slate-200 font-semibold">
                  {analytics.resourceUsage.items}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-slate-400 mb-2">
              团队活跃度
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">活跃成员</span>
                <span className="text-slate-200 font-semibold">
                  {analytics.teamActivity.activeMembers}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">今日操作</span>
                <span className="text-slate-200 font-semibold">
                  {analytics.teamActivity.actionsToday}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
```

### 阶段六：响应式优化（2天）

#### 3.10 移动端适配

**断点系统**
```css
/* apps/web/src/styles/responsive.css */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -100%;
    z-index: 50;
    transition: left 0.3s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .main-content {
    margin-left: 0;
  }
}

@media (min-width: 769px) {
  .sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .main-content {
    margin-left: 16rem;
  }
}
```

## 四、实施时间表

### 第1周：基础设计系统
- Day 1-2: 设计系统重构（色彩、间距、圆角、阴影）
- Day 3-4: 组件样式统一（Card、Button、Input、Select）
- Day 5: 动画效果实现

### 第2周：项目创建优化
- Day 1-2: 视频比例选择器开发
- Day 3-4: 风格选择器开发
- Day 5: 风格详情卡片开发

### 第3周：导航和物品管理
- Day 1-2: 左侧导航重构
- Day 3-5: 物品管理模块开发
- Day 6-7: 物品卡片组件开发

### 第4周：数据分析和响应式
- Day 1-3: 数据分析看板开发
- Day 4-5: 响应式适配
- Day 6-7: 测试和优化

## 五、质量保证

### 5.1 设计审查清单

- [ ] 色彩对比度符合WCAG AA标准
- [ ] 字体大小在移动端可读
- [ ] 交互元素最小点击区域44x44px
- [ ] 加载状态清晰可见
- [ ] 错误状态明确提示
- [ ] 空状态友好引导

### 5.2 性能优化

- [ ] 图片懒加载
- [ ] 虚拟滚动（长列表）
- [ ] 代码分割（路由级别）
- [ ] 缓存策略（API响应）
- [ ] 图片压缩和优化

### 5.3 测试计划

- [ ] 单元测试（组件）
- [ ] 集成测试（页面）
- [ ] E2E测试（关键流程）
- [ ] 视觉回归测试（截图对比）
- [ ] 性能测试（Lighthouse）

## 六、成功指标

### 6.1 用户体验指标
- **任务完成率**：从X%提升到Y%
- **平均任务时间**：从X分钟降低到Y分钟
- **用户满意度**：达到4.5/5星
- **错误率**：降低X%

### 6.2 业务指标
- **项目创建转化率**：提升X%
- **功能使用率**：风格选择使用率达到Y%
- **用户留存率**：提升X%
- **NPS得分**：达到Y分

## 七、风险和缓解

### 7.1 技术风险
- **风险**：设计系统重构可能影响现有组件
- **缓解**：渐进式迁移，保持向后兼容

### 7.2 时间风险
- **风险**：4周时间可能紧张
- **缓解**：优先实现核心功能，次要功能后续迭代

### 7.3 质量风险
- **风险**：快速开发可能影响质量
- **缓解**：充分的测试和代码审查

## 八、后续优化方向

### 8.1 短期优化（1-2个月）
- 物品管理完善
- 数据分析增强
- 团队协作优化
- 性能优化

### 8.2 中期优化（3-6个月）
- AI风格自动应用
- 智能推荐系统
- 高级数据分析
- 自定义主题

### 8.3 长期优化（6-12个月）
- 实时协作
- 移动端原生应用
- 插件市场
- 企业级功能

## 九、总结

本计划将LIKE AI.pro的优秀设计系统性地移植到KaiyanTool，通过4个阶段的实施，全面提升产品的视觉设计、用户体验和功能完整性。

**核心价值**：
1. 提升专业度和美观度
2. 改善用户体验和易用性
3. 增强功能完整性和竞争力
4. 建立可扩展的设计系统

**关键成功因素**：
- 严格遵循设计规范
- 充分的测试和验证
- 渐进式实施降低风险
- 持续收集用户反馈优化
