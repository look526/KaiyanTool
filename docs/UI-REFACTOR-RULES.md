# 开演AI 界面重构设计规范

> 本规范定义了界面重构工作中所有 UI 组件的设计标准，确保一致性和专业性。

---

## 一、按钮组件设计规范

### 1.1 尺寸规范

| 尺寸 | 高度 | 内边距 | 字号 | 图标尺寸 | 使用场景 |
|------|------|--------|------|----------|----------|
| `xs` | 28px | 10px | 12px | 12px | 极小按钮、标签 |
| `sm` | 32px | 14px | 14px | 14px | 表格操作、紧凑区域 |
| `md` | 40px | 16px | 14px | 16px | 默认尺寸，通用场景 |
| `lg` | 44px | 20px | 16px | 18px | 表单提交、主要操作 |
| `xl` | 48px | 24px | 16px | 18px | 落地页 CTA、重要操作 |
| `2xl` | 56px | 32px | 18px | 20px | 营销页面主按钮 |
| `icon-xs` | 28px | - | - | 12px | 极小图标按钮 |
| `icon-sm` | 32px | - | - | 14px | 小图标按钮 |
| `icon` | 40px | - | - | 18px | 图标按钮（正方形） |
| `icon-lg` | 44px | - | - | 20px | 大图标按钮 |

### 1.2 变体规范

#### Primary（主要按钮）
```css
/* 默认状态 */
background: var(--color-primary);        /* #007AFF */
color: white;
border-radius: var(--radius-lg);         /* 14px */
box-shadow: var(--shadow-button);        /* 0 2px 4px rgba(0,0,0,0.08) */

/* 悬停状态 */
background: var(--color-primary-hover);  /* #0056CC */
box-shadow: var(--shadow-button-hover);  /* 0 4px 12px rgba(0,122,255,0.25) */

/* 点击状态 */
background: var(--color-primary-active); /* #0044A3 */
box-shadow: var(--shadow-sm);
```

#### Secondary（次要按钮）
```css
/* 默认状态 */
background: var(--bg-secondary);
color: var(--text-primary);
border: 1px solid var(--border-primary);
box-shadow: var(--shadow-xs);

/* 悬停状态 */
background: var(--bg-hover);
border-color: var(--border-secondary);
```

#### Outline（轮廓按钮）
```css
/* 默认状态 */
background: transparent;
color: var(--text-primary);
border: 1px solid var(--border-primary);

/* 悬停状态 */
background: var(--bg-hover);
border-color: var(--color-primary);
color: var(--color-primary);
```

#### Ghost（幽灵按钮）
```css
/* 默认状态 */
background: transparent;
color: var(--text-secondary);

/* 悬停状态 */
background: var(--bg-hover);
color: var(--text-primary);
```

#### Danger（危险按钮）
```css
/* 默认状态 */
background: var(--error);                /* #FF3B30 */
color: white;

/* 悬停状态 */
background: var(--error-hover);          /* #D63027 */
box-shadow: var(--glow-error);           /* 0 4px 20px rgba(255,59,48,0.3) */
```

#### Success（成功按钮）
```css
/* 默认状态 */
background: var(--success);              /* #34C759 */
color: white;

/* 悬停状态 */
background: var(--success-hover);        /* #2AA147 */
box-shadow: var(--glow-success);         /* 0 4px 20px rgba(52,199,89,0.3) */
```

### 1.3 状态规范

| 状态 | 视觉表现 | 交互行为 |
|------|----------|----------|
| **默认** | 标准样式 | 可点击 |
| **悬停** | 背景加深 + 阴影增强 + 轻微上移 (-1px) | 鼠标指针变为 pointer |
| **点击** | 背景再加深 + 阴影减弱 + 回到原位 | 视觉反馈 |
| **禁用** | opacity: 0.5 | cursor: not-allowed，不可点击 |
| **加载** | 显示旋转图标，文字变为"处理中..." | 不可点击 |
| **焦点** | 显示 focus ring (2px solid primary) | 键盘导航可见 |

### 1.3.1 悬停效果详解

```css
/* Primary 按钮悬停效果 */
.button-primary:hover {
  /* 1. 背景颜色加深 */
  background: var(--color-primary-hover);  /* #0056CC */
  
  /* 2. 阴影增强，产生浮起感 */
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.35);
  
  /* 3. 轻微上移，增强交互感 */
  transform: translateY(-1px);
  
  /* 4. 平滑过渡 */
  transition: all 200ms ease-out;
}

/* 点击效果 */
.button-primary:active {
  background: var(--color-primary-active);  /* #0044A3 */
  box-shadow: 0 1px 4px rgba(0, 122, 255, 0.2);
  transform: translateY(0);
}
```

### 1.3.2 状态切换时间线

```
默认 ──[悬停进入]──> 悬停 ──[点击]──> 点击 ──[释放]──> 悬停 ──[离开]──> 默认
  │                    │                  │                │
  └── 200ms ease-out ──┘                  └── 瞬间 ────────┘
```

### 1.4 图标规范

```tsx
// 图标位置：left 或 right
// 图标与文字间距：var(--space-2) (8px)
// 图标尺寸跟随按钮尺寸

<Button icon={<Plus size={16} />} iconPosition="left">
  创建项目
</Button>

<Button icon={<ArrowRight size={16} />} iconPosition="right">
  下一步
</Button>
```

### 1.5 按钮组（ButtonGroup）

```tsx
// 默认按钮组（带间距）
<ButtonGroup>
  <Button variant="outline">取消</Button>
  <Button variant="outline">保存草稿</Button>
  <Button variant="primary">发布</Button>
</ButtonGroup>

// 紧密连接的按钮组
<ButtonGroup attached>
  <Button variant="outline">左</Button>
  <Button variant="outline">中</Button>
  <Button variant="outline">右</Button>
</ButtonGroup>

// 垂直按钮组
<ButtonGroup orientation="vertical" attached>
  <Button variant="outline">上</Button>
  <Button variant="outline">中</Button>
  <Button variant="outline">下</Button>
</ButtonGroup>
```

### 1.6 Link 变体

```tsx
// 链接样式按钮
<Button variant="link">了解更多</Button>

// 特点：
// - 透明背景
// - 主色文字
// - 悬停时显示下划线
// - 适用于内联文本中的操作
```

### 1.7 可访问性规范

| 属性 | 用途 | 示例 |
|------|------|------|
| `aria-label` | 图标按钮必须提供 | `<Button icon={<Plus />} aria-label="添加" />` |
| `aria-busy` | 加载状态标识 | `<Button loading aria-busy="true" />` |
| `aria-disabled` | 禁用状态标识 | `<Button disabled aria-disabled="true" />` |
| `focus-visible:ring` | 键盘焦点可见 | 所有按钮默认包含 |

---

## 二、布局原则

### 2.1 间距系统（4px 网格）

| 变量 | 值 | 使用场景 |
|------|-----|----------|
| `--space-1` | 4px | 最小间距、图标与文字 |
| `--space-2` | 8px | 紧凑元素间距 |
| `--space-3` | 12px | 表单字段间距 |
| `--space-4` | 16px | 卡片内边距、默认间距 |
| `--space-5` | 20px | 中等间距 |
| `--space-6` | 24px | 区块间距 |
| `--space-8` | 32px | 大区块间距 |
| `--space-10` | 40px | 页面区域间距 |
| `--space-12` | 48px | 主要区域分隔 |

### 2.2 对齐原则

#### 按钮组对齐
```tsx
// 水平按钮组：使用 gap 统一间距
<div style={{ display: 'flex', gap: 'var(--space-3)' }}>
  <Button variant="outline">取消</Button>
  <Button variant="primary">确认</Button>
</div>

// 右对齐操作按钮
<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
  <Button variant="ghost">取消</Button>
  <Button variant="primary">保存</Button>
</div>

// 两端对齐
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
  <Button variant="ghost" icon={<Trash2 />}>删除</Button>
  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
    <Button variant="outline">取消</Button>
    <Button variant="primary">保存</Button>
  </div>
</div>
```

#### 表单对齐
```tsx
// 标签左对齐，输入框占满宽度
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
  <div>
    <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>标签</label>
    <Input style={{ width: '100%' }} />
  </div>
</div>
```

### 2.3 层级关系

| 层级 | z-index | 元素类型 |
|------|---------|----------|
| 基础层 | 0-10 | 页面内容、卡片 |
| 浮动层 | 100-200 | 下拉菜单、工具提示 |
| 固定层 | 1000-1030 | 导航栏、侧边栏 |
| 遮罩层 | 1040 | 模态框背景 |
| 模态层 | 1050 | 模态框内容 |
| 顶层 | 1060-1080 | 弹出框、Toast |

### 2.4 响应式断点

| 断点 | 宽度 | 布局调整 |
|------|------|----------|
| 移动端 | < 768px | 单列布局，隐藏次要信息 |
| 平板 | 768px - 1024px | 双列布局，简化导航 |
| 桌面 | > 1024px | 多列布局，完整功能 |

---

## 三、交互逻辑规范

### 3.1 点击反馈

```tsx
// 所有可点击元素必须包含：
// 1. cursor: pointer
// 2. 悬停状态视觉变化
// 3. 过渡动画（200-300ms）

const clickableStyle = {
  cursor: 'pointer',
  transition: 'all var(--duration-normal) var(--ease-out)',
  // 悬停时：
  // - 背景色变化
  // - 边框色变化
  // - 或阴影变化
};
```

### 3.2 禁用状态处理

```tsx
// 禁用状态样式
const disabledStyle = {
  opacity: 0.5,
  cursor: 'not-allowed',
  pointerEvents: 'none', // 阻止所有交互
};

// 禁用条件示例
<Button 
  disabled={loading || !formValid || !hasChanges}
  loading={loading}
>
  {loading ? '保存中...' : '保存'}
</Button>
```

### 3.3 加载状态

```tsx
// 加载中的按钮
<Button loading={isSubmitting}>
  {isSubmitting ? '处理中...' : '提交'}
</Button>

// 加载指示器样式
const loadingSpinner = {
  animation: 'spin 1s linear infinite',
  width: '16px',
  height: '16px',
};
```

### 3.4 表单交互

```tsx
// 输入框焦点状态
const inputFocusStyle = {
  borderColor: 'var(--color-primary)',
  boxShadow: '0 0 0 3px var(--color-primary-light)',
};

// 错误状态
const inputErrorStyle = {
  borderColor: 'var(--error)',
  boxShadow: '0 0 0 3px var(--error-light)',
};

// 成功状态
const inputSuccessStyle = {
  borderColor: 'var(--success)',
  boxShadow: '0 0 0 3px var(--success-light)',
};
```

---

## 四、与其他 UI 元素的协调标准

### 4.1 按钮与输入框

```tsx
// 高度对齐原则：按钮高度应与输入框高度一致
// sm 按钮 (32px) + sm 输入框 (32px)
// md 按钮 (40px) + md 输入框 (40px)
// lg 按钮 (44px) + lg 输入框 (44px)

<div style={{ display: 'flex', gap: 'var(--space-2)' }}>
  <Input size="md" style={{ flex: 1 }} />
  <Button size="md" variant="primary">搜索</Button>
</div>
```

### 4.2 按钮与卡片

```tsx
// 卡片内按钮布局
<div style={{ 
  padding: 'var(--space-5)',
  backgroundColor: 'var(--bento-bg)',
  borderRadius: 'var(--radius-xl)',
  border: '1px solid var(--bento-border)',
}}>
  <h3>卡片标题</h3>
  <p>卡片内容...</p>
  <div style={{ 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: 'var(--space-3)',
    marginTop: 'var(--space-4)',
    paddingTop: 'var(--space-4)',
    borderTop: '1px solid var(--border-subtle)',
  }}>
    <Button variant="ghost" size="sm">取消</Button>
    <Button variant="primary" size="sm">确认</Button>
  </div>
</div>
```

### 4.3 按钮与模态框

```tsx
// 模态框底部按钮布局
<div style={{
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--space-3)',
  padding: 'var(--space-4) var(--space-6)',
  borderTop: '1px solid var(--border-subtle)',
}}>
  <Button variant="outline" onClick={onClose}>取消</Button>
  <Button variant="primary" onClick={onConfirm}>确认</Button>
</div>
```

### 4.4 按钮与表格

```tsx
// 表格操作按钮
<div style={{ display: 'flex', gap: 'var(--space-1)' }}>
  <Button variant="ghost" size="icon-sm" icon={<Edit size={14} />} />
  <Button variant="ghost" size="icon-sm" icon={<Trash2 size={14} />} />
</div>

// 表格顶部操作栏
<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
    <Input placeholder="搜索..." />
    <Button variant="outline" icon={<Filter size={16} />}>筛选</Button>
  </div>
  <Button variant="primary" icon={<Plus size={16} />}>新建</Button>
</div>
```

---

## 五、颜色使用规范

### 5.1 语义颜色

| 颜色 | 变量 | 使用场景 |
|------|------|----------|
| 主色 | `var(--color-primary)` | 主要按钮、链接、选中状态 |
| 成功 | `var(--success)` | 成功提示、确认操作 |
| 警告 | `var(--warning)` | 警告提示、注意事项 |
| 错误 | `var(--error)` | 错误提示、删除操作 |
| 信息 | `var(--info)` | 信息提示、帮助说明 |

### 5.2 文字颜色层级

| 层级 | 变量 | 使用场景 |
|------|------|----------|
| 主要文字 | `var(--text-primary)` | 标题、重要内容 |
| 次要文字 | `var(--text-secondary)` | 正文、描述 |
| 辅助文字 | `var(--text-tertiary)` | 提示、标签 |
| 禁用文字 | `var(--text-muted)` | 禁用状态、占位符 |

---

## 六、动画规范

### 6.1 过渡时长

| 时长 | 变量 | 使用场景 |
|------|------|----------|
| 快速 | 150ms | 按钮悬停、图标变化 |
| 正常 | 200ms | 卡片悬停、输入框焦点 |
| 慢速 | 300ms | 模态框、页面切换 |

### 6.2 缓动函数

| 函数 | 变量 | 使用场景 |
|------|------|----------|
| ease-out | `var(--ease-out)` | 大多数过渡效果 |
| ease-in-out | `var(--ease-in-out)` | 往返动画 |
| bounce | `var(--ease-bounce)` | 弹性效果 |

### 6.3 动画类型

```css
/* 淡入上移 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 缩放进入 */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

/* 旋转加载 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## 七、代码规范

### 7.1 样式优先级

1. **优先使用设计令牌**：使用 CSS 变量而非硬编码值
2. **内联样式用于动态值**：状态相关的样式使用内联
3. **CSS 文件用于静态样式**：动画、基础样式放在 CSS 文件

### 7.2 组件命名

```tsx
// 按钮变体命名
<Button variant="primary" />    // 主要按钮
<Button variant="secondary" />  // 次要按钮
<Button variant="outline" />    // 轮廓按钮
<Button variant="ghost" />      // 幽灵按钮
<Button variant="danger" />     // 危险按钮
<Button variant="success" />    // 成功按钮

// 尺寸命名
<Button size="sm" />
<Button size="md" />
<Button size="lg" />
<Button size="xl" />
<Button size="icon" />
```

### 7.3 可访问性

```tsx
// 所有按钮必须有明确的标签或 aria-label
<Button aria-label="保存">保存</Button>
<Button icon={<Plus />} aria-label="添加项目" />

// 禁用状态使用 aria-disabled
<Button disabled aria-disabled="true">不可用</Button>

// 加载状态使用 aria-busy
<Button loading aria-busy="true">处理中...</Button>
```

---

## 八、检查清单

### 重构前检查
- [ ] 确认按钮变体是否正确（primary/secondary/outline/ghost）
- [ ] 确认按钮尺寸是否与周围元素协调
- [ ] 确认间距使用设计令牌（var(--space-*)）

### 重构中检查
- [ ] 所有可点击元素有 cursor: pointer
- [ ] 所有交互元素有过渡动画
- [ ] 禁用状态样式正确
- [ ] 加载状态有视觉反馈

### 重构后检查
- [ ] 悬停状态视觉反馈明显
- [ ] 颜色对比度符合 WCAG AA 标准
- [ ] 键盘导航可用
- [ ] 屏幕阅读器可识别
