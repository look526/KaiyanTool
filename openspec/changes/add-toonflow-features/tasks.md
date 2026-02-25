# Tasks: add-toonflow-features

## Phase 1: 素材管理系统 (Asset Management)

### Task 1.1: 素材上传功能
- [x] 后端：创建素材上传 API
- [x] 后端：支持图片/视频文件存储
- [x] 前端：添加素材上传组件
- [x] 前端：创建素材管理页面

### Task 1.2: 素材库浏览
- [x] 后端：素材列表查询 API
- [x] 前端：素材网格/列表展示
- [x] 前端：素材筛选和搜索

---

## Phase 2: 图像生成系统 (Image Generation)

### Task 2.1: 图像生成基础服务
- [x] 后端：集成图像生成 AI 模型 (如 RunDiffusion, Kling, Volcengine 等)
- [x] 后端：创建图像生成 API
- [x] 后端：支持多种图像模型切换

### Task 2.2: 图像生成前端页面
- [x] 前端：创建图像生成页面
- [x] 前端：显示生成进度和结果
- [x] 前端：图像预览和下载

### Task 2.3: 分镜图像生成
- [x] 后端：分镜图像批量生成服务
- [x] 前端：分镜页面图像生成功能
- [x] 前端：批量生成进度展示

---

## Phase 3: 视频生成系统 (Video Generation)

### Task 3.1: 视频生成基础服务
- [x] 后端：集成视频生成 AI 模型 (如 Kling, Runway, Pika 等)
- [x] 后端：创建视频生成 API
- [x] 后端：视频生成状态管理

### Task 3.2: 视频生成前端页面
- [x] 前端：创建视频生成页面
- [x] 前端：视频预览和下载
- [x] 前端：生成历史记录

### Task 3.3: 视频合成
- [x] 后端：多镜头视频合成服务
- [x] 前端：视频合成页面
- [x] 支持配乐和音效

---

## Phase 4: 提示词优化 (Prompt Optimization)

### Task 4.1: 提示词优化服务
- [x] 后端：提示词优化 AI 服务
- [x] 后端：创建提示词优化 API
- [x] 支持图像和视频提示词优化

### Task 4.2: 提示词优化前端
- [x] 前端：提示词优化工具组件
- [x] 前端：嵌入各生成页面 (ScriptEditorPage, ShotsPage 等)

---

## Phase 5: 任务系统 (Task Queue)

### Task 5.1: 任务队列服务
- [x] 后端：创建任务队列服务 (inference-queue.service.ts)
- [x] 后端：任务状态追踪 (getTaskStatus)
- [x] 后端：任务重试机制 (Bull Queue)

### Task 5.2: 任务管理前端
- [x] 前端：任务进度展示 (RenderQueuePanel.tsx)
- [x] 前端：任务历史列表 (RenderQueuePanel)
- [x] 前端：取消任务功能 (inference-queue.service.ts)

---

## Phase 6: 视频导出 (Video Export)

### Task 6.1: 导出格式支持
- [x] 后端：支持 MP4/WebM/MOV 格式
- [x] 后端：分辨率和帧率设置 (video-transcoder.service.ts)
- [x] 后端：PR 项目导出 (Premiere XML) (premiere-export.service.ts)

### Task 6.2: 导出前端
- [x] 前端：导出设置面板
- [x] 前端：导出进度展示
- [x] 前端：下载已完成视频

### Task 6.3: 批量导出
- [x] 后端：批量资产导出 API
- [x] 后端：关键帧批量导出
- [x] 后端：项目完整导出

### Task 6.4: 专业导出
- [x] 后端：Premiere Pro 项目导出
- [x] 后端：After Effects 项目导出
- [x] 后端：EDL/XML 格式导出
- [x] 前端：导出格式选择器

---

## Implementation Order

1. 先实现素材管理系统（基础）✅ 完成
2. 图像生成系统（核心功能）✅ 完成
3. 任务系统（基础设施）✅ 完成
4. 视频生成系统（核心功能）✅ 完成
5. 提示词优化（辅助功能）✅ 完成
6. 视频导出（完善功能）✅ 完成

---

## Dependencies

- Phase 1 (素材管理) 是其他功能的基础
- Phase 2 (图像生成) 和 Phase 3 (视频生成) 可以并行开发
- Phase 5 (任务系统) 为 Phase 2 和 Phase 3 提供异步支持
