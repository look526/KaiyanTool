# 基于可灵AI的页面设计计划书

## 一、可灵AI页面设计分析

### 1.1 设计特点总结

通过分析可灵AI（Kling AI）的官网界面，提炼出以下核心设计特点：

#### 界面布局
- **极简主义风格**：采用左侧操作区 + 右侧展示区的经典布局
- **清晰的视觉层次**：操作区域简洁，结果区域突出
- **模块化卡片设计**：功能区块明确划分，使用卡片式布局

#### 用户体验
- **新手友好**：提供"推荐尝试"功能，降低使用门槛
- **快速生成**：简化操作流程，一键生成内容
- **参考图功能**：支持上传参考图片以固定风格
- **批量生成**：支持一次生成多张图片/视频

#### 视觉设计
- **渐变色彩**：使用现代感强烈的渐变背景和装饰
- **圆角卡片**：大圆角设计（16px-24px），视觉柔和
- **微动效**：悬停效果、点击反馈等交互动画
- **高对比度**：确保内容清晰可读

#### 功能组织
- **左导航 + 主内容区**：功能入口在左侧，主工作区在右侧
- **分类明确**：AI图片、AI视频、AI编辑等功能分区
- **快速入口**：提供热门模板和快捷操作按钮

### 1.2 可灵AI界面结构

```
┌─────────────────────────────────────────────────────────────────┐
│  顶部导航栏：Logo | 功能菜单 | 用户信息                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│  │  左侧操作面板     │  │        右侧结果展示区                 │ │
│  │                  │  │                                      │ │
│  │  - 功能切换       │  │  ┌────────┐  ┌────────┐  ┌────────┐ │ │
│  │  - 参数输入       │  │  │ 图片1  │  │ 图片2  │  │ 图片3  │ │ │
│  │  - 参考图上传     │  │  └────────┘  └────────┘  └────────┘ │ │
│  │  - 推荐尝试       │  │  ┌────────┐  ┌────────┐  ┌────────┐ │ │
│  │  - 生成按钮       │  │  │ 图片4  │  │ 图片5  │  │ 图片6  │ │ │
│  │                  │  │  └────────┘  └────────┘  └────────┘ │ │
│  └──────────────────┘  └──────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 二、开演AI平台重构设计计划

### 2.1 设计理念融合

将可灵AI的优秀设计理念与开演AI的Bento Grid设计语言相结合：

#### 核心设计原则
1. **极简 + 模块化**：保持界面简洁，同时使用Bento Grid模块化布局
2. **新手友好**：提供智能推荐和快捷操作
3. **快速反馈**：操作后立即展示结果
4. **视觉愉悦**：使用渐变色彩和流畅动画

### 2.2 页面布局设计

#### 主工作区布局（参考可灵AI）

```
┌─────────────────────────────────────────────────────────────────┐
│  BentoGrid 工作区                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │   BentoCardMedium    │  │       BentoCardLarge            │ │
│  │   (左侧操作面板)      │  │       (右侧结果展示区)          │ │
│  │                      │  │                                  │ │
│  │  ┌────────────────┐  │  │  ┌──────┐ ┌──────┐ ┌──────┐   │ │
│  │  │ 功能切换       │  │  │  │ 图片1│ │ 图片2│ │ 图片3│   │ │
│  │  │ Tabs/Select    │  │  │  └──────┘ └──────┘ └──────┘   │ │
│  │  └────────────────┘  │  │                                  │ │
│  │                      │  │  ┌──────┐ ┌──────┐ ┌──────┐   │ │
│  │  ┌────────────────┐  │  │  │ 图片4│ │ 图片5│ │ 图片6│   │ │
│  │  │ 参数输入区     │  │  │  └──────┘ └──────┘ └──────┘   │ │
│  │  │ Input/Textarea  │  │  │                                  │ │
│  │  └────────────────┘  │  │  批量操作栏                        │ │
│  │                      │  │  [下载] [收藏] [分享]              │ │
│  │  ┌────────────────┐  │  │                                  │ │
│  │  │ 推荐尝试       │  │  │  进度条/加载状态                    │ │
│  │  │ Quick Prompts  │  │  │  ████████░░░░░░░ 60%              │ │
│  │  └────────────────┘  │  │                                  │ │
│  │                      │  └──────────────────────────────────┘ │
│  │  ┌────────────────┐  │                                        │
│  │  │ 生成按钮       │  │  ┌──────────────────────────────────┐ │ │
│  │  │ [生成]         │  │  │     BentoCardSmall                │ │ │
│  │  └────────────────┘  │  │     历史记录                       │ │ │
│  └──────────────────────┘  │  └──────────────────────────────────┘ │ │
│                             ┌──────────────────────────────────┐ │ │
│                             │     BentoCardSmall                │ │ │
│                             │     收藏夹                         │ │ │
│                             └──────────────────────────────────┘ │ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 核心功能模块设计

#### 2.3.1 推荐尝试功能

```typescript
interface QuickPromptCard {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  tags: string[];
}

interface QuickPromptsProps {
  prompts: QuickPromptCard[];
  onSelect: (prompt: string) => void;
}

const QuickPrompts: React.FC<QuickPromptsProps> = ({ prompts, onSelect }) => {
  return (
    <div className="quick-prompts-container">
      <div className="quick-prompts-title">推荐尝试</div>
      <div className="quick-prompts-grid">
        {prompts.map((prompt) => (
          <BentoCardSmall
            key={prompt.id}
            icon={prompt.icon}
            label={prompt.label}
            tags={prompt.tags}
            onClick={() => onSelect(prompt.prompt)}
            hoverEffect="scale"
          />
        ))}
      </div>
    </div>
  );
};
```

#### 2.3.2 参考图功能

```typescript
interface ReferenceImageUploader {
  images: File[];
  onUpload: (images: File[]) => void;
  maxImages: number;
}

const ReferenceImageUploader: React.FC<ReferenceImageUploader> = ({
  images,
  onUpload,
  maxImages
}) => {
  return (
    <BentoCardMedium className="reference-uploader">
      <div className="uploader-header">
        <h3>参考图</h3>
        <span className="image-count">{images.length}/{maxImages}</span>
      </div>
      <div className="upload-area">
        {images.map((image, index) => (
          <div key={index} className="reference-thumb">
            <img src={URL.createObjectURL(image)} alt={`参考图${index + 1}`} />
            <button className="remove-btn">×</button>
          </div>
        ))}
        {images.length < maxImages && (
          <button className="add-btn">+</button>
        )}
      </div>
      <div className="reference-strength">
        <label>参考强度</label>
        <input type="range" min="0" max="100" defaultValue="50" />
      </div>
    </BentoCardMedium>
  );
};
```

#### 2.3.3 批量结果展示

```typescript
interface ResultGallery {
  results: GeneratedItem[];
  onLoadMore: () => void;
  onDownload: (item: GeneratedItem) => void;
  onFavorite: (item: GeneratedItem) => void;
}

const ResultGallery: React.FC<ResultGallery> = ({
  results,
  onLoadMore,
  onDownload,
  onFavorite
}) => {
  return (
    <BentoCardLarge className="result-gallery">
      <div className="gallery-header">
        <h3>生成结果</h3>
        <div className="view-toggle">
          <button className="active">网格</button>
          <button>列表</button>
        </div>
      </div>
      <div className="results-grid">
        {results.map((result, index) => (
          <ResultCard
            key={result.id}
            item={result}
            onDownload={() => onDownload(result)}
            onFavorite={() => onFavorite(result)}
            animationDelay={index * 50}
          />
        ))}
      </div>
      <div className="load-more-container">
        <button onClick={onLoadMore}>加载更多</button>
      </div>
    </BentoCardLarge>
  );
};
```

### 2.4 交互设计规范

#### 2.4.1 动画效果

```css
/* 卡片悬停效果 */
.bento-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.bento-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-hover);
}

/* 点击反馈 */
.bento-card:active {
  transform: scale(0.98);
}

/* 渐进式入场动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card {
  animation: fadeInUp 0.5s ease forwards;
}

/* 加载状态 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, 
    var(--card-bg) 25%, 
    var(--card-elevated) 50%, 
    var(--card-bg) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

#### 2.4.2 渐变配色方案

```css
/* 主色调渐变 */
.gradient-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0055D4 100%);
}

.gradient-purple {
  background: linear-gradient(135deg, #AF52DE 0%, #8E44AD 100%);
}

.gradient-pink {
  background: linear-gradient(135deg, #FF2D55 0%, #D63031 100%);
}

.gradient-orange {
  background: linear-gradient(135deg, #FF9500 0%, #E67E22 100%);
}

.gradient-green {
  background: linear-gradient(135deg, #34C759 0%, #27AE60 100%);
}

/* 卡片渐变装饰 */
.bento-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-color-1), var(--accent-color-2));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}
```

### 2.5 页面级重构计划

#### 2.5.1 图像/视频生成页面

**参考可灵AI的生成页面设计：**

- 左侧：参数输入 + 推荐提示 + 参考图上传
- 右侧：结果网格 + 批量操作 + 历史记录
- 底部：进度条 + 状态提示

```typescript
const ImageGenerationPage: React.FC = () => {
  return (
    <div className="generation-page">
      <BentoGrid>
        <BentoCardMedium colSpan={1} rowSpan={2}>
          <ParameterPanel />
          <QuickPrompts />
          <ReferenceImageUploader />
          <GenerateButton />
        </BentoCardMedium>
        
        <BentoCardLarge colSpan={2} rowSpan={2}>
          <ResultGallery />
        </BentoCardLarge>
        
        <BentoCardSmall>
          <HistoryPanel />
        </BentoCardSmall>
        
        <BentoCardSmall>
          <FavoritesPanel />
        </BentoCardSmall>
      </BentoGrid>
    </div>
  );
};
```

#### 2.5.2 角色管理页面

- 左侧：角色列表 + 搜索筛选
- 中间：角色详情卡片（BentoCardLarge）
- 右侧：定妆照画廊 + 属性编辑

#### 2.5.3 分镜管理页面

- 顶部：时间线导航（BentoCardWide）
- 中间：分镜卡片网格
- 侧边：批量操作工具栏

#### 2.5.4 AI 提供商页面

- 顶部：提供商概览统计（BentoStatsCard）
- 中间：提供商卡片网格（BentoCardMedium）
- 侧边：模型配置面板

### 2.6 性能优化策略

#### 2.6.1 图片懒加载

```typescript
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="lazy-image-container">
      {isVisible ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="skeleton" />
      )}
    </div>
  );
};
```

#### 2.6.2 虚拟滚动

```typescript
const VirtualScrollList: React.FC<{
  items: any[];
  renderItem: (item: any) => React.ReactNode;
}> = ({ items, renderItem }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const start = Math.floor(scrollTop / 200);
        const end = start + 20;
        setVisibleRange({ start, end });
      }
    };

    containerRef.current?.addEventListener('scroll', handleScroll);
    return () => containerRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="virtual-scroll-container">
      <div style={{ height: items.length * 200 }}>
        {items.slice(visibleRange.start, visibleRange.end).map(renderItem)}
      </div>
    </div>
  );
};
```

### 2.7 响应式设计

```css
/* 移动端 */
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  
  .generation-page {
    flex-direction: column;
  }
  
  .result-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 平板端 */
@media (min-width: 769px) and (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .result-gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 桌面端 */
@media (min-width: 1025px) {
  .bento-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .result-gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 2.8 无障碍设计

```html
<!-- 键盘导航支持 -->
<button
  className="bento-card"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  aria-label="生成图片"
>
  <span className="icon">🎨</span>
  <span className="label">生成图片</span>
</button>

<!-- 屏幕阅读器支持 -->
<div role="region" aria-label="生成结果">
  <h2>生成结果</h2>
  <ul>
    {results.map((result) => (
      <li key={result.id}>
        <img 
          src={result.url} 
          alt={`生成图片：${result.prompt}`}
          aria-describedby={`result-${result.id}-desc`}
        />
        <p id={`result-${result.id}-desc`}>
          {result.prompt}
        </p>
      </li>
    ))}
  </ul>
</div>
```

## 三、实施计划

### 3.1 阶段划分

#### Phase 1: 核心组件开发（Week 1-2）
- [ ] 开发 `QuickPrompts` 组件
- [ ] 开发 `ReferenceImageUploader` 组件
- [ ] 开发 `ResultGallery` 组件
- [ ] 开发 `ResultCard` 组件
- [ ] 开发 `BatchActionBar` 组件

#### Phase 2: 图像/视频生成页面（Week 3-4）
- [ ] 重构 `ImageGenerationPage.tsx`
- [ ] 重构 `VideoGenerationPage.tsx`
- [ ] 实现左侧操作面板
- [ ] 实现右侧结果展示区
- [ ] 添加进度条和状态提示

#### Phase 3: 其他页面重构（Week 5-8）
- [ ] 重构角色管理页面
- [ ] 重构场景管理页面
- [ ] 重构分镜管理页面
- [ ] 重构AI提供商页面

#### Phase 4: 优化与测试（Week 9-10）
- [ ] 性能优化
- [ ] 响应式测试
- [ ] 无障碍测试
- [ ] 用户测试

### 3.2 成功指标

- [ ] 页面加载时间 < 2s
- [ ] 首次内容绘制（FCP）< 1s
- [ ] 交互时间（TTI）< 3s
- [ ] Lighthouse 性能评分 ≥ 90
- [ ] 无障碍评分 ≥ 95
- [ ] 用户满意度 ≥ 85%

## 四、技术栈

### 4.1 前端框架
- React 18
- TypeScript
- Next.js 14

### 4.2 UI 组件库
- shadcn/ui（基础组件）
- 自定义 Bento 组件
- Framer Motion（动画）

### 4.3 状态管理
- Zustand（轻量级状态管理）
- React Query（数据获取）

### 4.4 工具库
- clsx/tailwind-merge（样式合并）
- react-hot-toast（提示消息）
- react-dropzone（文件上传）

## 五、总结

本计划书基于可灵AI的优秀设计理念，结合开演AI的Bento Grid设计语言，制定了一套完整的页面重构方案。核心特点包括：

1. **极简 + 模块化**：保持界面简洁，使用Bento Grid模块化布局
2. **新手友好**：提供智能推荐和快捷操作
3. **快速反馈**：操作后立即展示结果
4. **视觉愉悦**：使用渐变色彩和流畅动画

通过这套设计系统，可以显著提升开演AI平台的用户体验和视觉品质。
