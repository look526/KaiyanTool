# Tasks: Redesign Linear Workflow

## Phase 1: 工作流导航与 UI 框架 (Week 1-2) ✅ COMPLETED

### 1.1 工作流状态管理

- [x] 创建 WorkflowProvider 上下文
  - 实现工作流状态数据结构
  - 实现步骤切换逻辑
  - 实现步骤完成状态管理
  - 添加本地缓存机制
  - **Validation**: 单元测试覆盖所有状态转换

- [x] 创建 useWorkflow Hook
  - 封装工作流状态访问
  - 提供计算属性（进度、可否继续等）
  - 实现步骤导航方法
  - **Validation**: Hook 测试通过

### 1.2 Sidebar 组件开发

- [x] 创建 WorkflowSidebar 组件
  - 实现步骤列表渲染
  - 实现步骤状态图标（待处理/进行中/已完成）
  - 实现步骤点击导航
  - 添加步骤进度指示器
  - **Validation**: 组件渲染正确，交互流畅

- [x] 创建 WorkflowStepItem 组件
  - 实现步骤项样式
  - 实现子步骤展开/收起
  - 实现步骤完成动画
  - 添加悬停效果
  - **Validation**: 视觉效果符合设计

- [x] 实现步骤状态自动检测
  - 剧本步骤：检测是否有剧本内容
  - 角色步骤：检测是否有角色及定妆照
  - 场景步骤：检测是否有场景数据
  - 分镜步骤：检测是否有分镜数据
  - **Validation**: 状态检测准确

### 1.3 主布局重构

- [x] 创建 ProjectLayout 组件
  - 实现三栏布局（Header + Sidebar + Main）
  - 实现响应式适配
  - 集成 WorkflowSidebar
  - 实现主内容区路由
  - **Validation**: 布局正确，响应式正常

- [x] 创建 ProjectHeader 组件
  - 显示项目名称
  - 添加全局操作按钮（保存、导出、设置）
  - 实现用户菜单
  - **Validation**: 组件功能完整

- [x] 更新路由配置
  - 配置项目工作区路由
  - 实现路由守卫
  - 配置步骤路由参数
  - **Validation**: 路由导航正确

---

## Phase 2: 剧本管理模块 (Week 3-4)

### 2.1 剧本编辑器重构

- [x] 创建 ScriptWorkspace 组件
  - 集成 Monaco Editor (已有ScriptEditorPage)
  - 实现剧本模板选择
  - 实现自动保存
  - 添加版本历史功能

- [x] 创建 ScriptToolbar 组件
  - 添加导入按钮（支持 txt、docx）
  - 添加导出按钮
  - 添加 AI 功能按钮
  - 实现模板选择下拉

- [x] 创建 ScriptPreview 组件
  - 实时预览解析结果
  - 显示场景数量
  - 显示角色列表
  - 显示字数统计

### 2.2 小说导入转换

- [x] 创建 NovelImporter 组件
  - 支持文本粘贴输入
  - 支持文件上传
  - 显示导入进度

- [x] 实现小说转剧本 API
  - 后端：创建转换服务 (novel-analysis.service.ts adaptToScript)
  - 后端：集成 AI 模型
  - 前端：调用转换 API
  - 前端：显示转换结果

- [x] 创建转换结果编辑器
  - 显示原文与转换结果对比
  - 支持手动调整
  - 支持重新转换

### 2.3 剧本解析优化

- [x] 增强 SceneParser 解析器
  - 支持更多剧本格式
  - 提高场景识别准确率
  - 优化角色提取逻辑
  - 添加对话归属识别

- [x] 创建解析结果确认界面
  - 显示解析出的场景列表
  - 显示解析出的角色列表
  - 支持手动调整
  - 支持重新解析

---

## Phase 3: 场景解析与数据流转 (Week 5-6) ✅ COMPLETED

### 3.1 场景管理重构

- [x] 创建 ScenesWorkspace 组件
  - 实现场景列表视图 (ScenesPage.tsx)
  - 实现场景卡片组件
  - 支持场景排序
  - 支持场景合并/拆分
  - **Validation**: 场景管理功能完整

- [x] 创建 SceneEditor 组件
  - 编辑场景基本信息
  - 编辑场景描述
  - 设置场景时间和氛围
  - 关联出场角色
  - **Validation**: 编辑功能完整

- [x] 创建 SceneConceptGenerator 组件
  - 生成场景概念图 (scene-concept.service.ts)
  - 支持多角度生成
  - 显示生成进度
  - 支持重新生成
  - **Validation**: 生成功能正常

### 3.2 数据流转机制

- [x] 实现剧本到场景的数据流转
  - 解析剧本自动创建场景
  - 场景与剧本段落关联
  - 支持剧本修改同步场景
  - **Validation**: 数据流转正确

- [x] 实现场景到分镜的数据流转
  - 场景信息传递到分镜
  - 场景角色列表传递
  - 场景参考图传递
  - **Validation**: 数据传递完整

- [x] 创建数据同步服务
  - 监听数据变更
  - 触发关联数据更新
  - 处理冲突情况
  - **Validation**: 同步机制稳定

---

## Phase 4: 角色一致性系统 (Week 7-8) ✅ COMPLETED

### 4.1 角色管理重构

- [x] 创建 CharactersWorkspace 组件
  - 实现角色列表视图 (CharactersPage.tsx)
  - 实现角色卡片组件
  - 显示角色定妆照状态
  - 显示一致性评分

- [x] 创建 CharacterEditor 组件
  - 编辑角色基本信息
  - 编辑角色外貌描述
  - 编辑角色性格特征
  - 支持从剧本提取角色

### 4.2 定妆照生成系统

- [x] 创建 PortraitGenerator 组件
  - 基于描述生成定妆照
  - 支持多角度生成
  - 支持风格选择
  - 显示生成进度

- [x] 创建 PortraitSelector 组件
  - 显示多个生成结果
  - 支持选择最佳定妆照
  - 支持重新生成
  - 支持手动上传

- [x] 实现定妆照锁定机制
  - 锁定选定的定妆照
  - 防止误操作修改
  - 支持解锁重新选择

### 4.3 服装变体系统

- [x] 创建 WardrobeManager 组件
  - 添加服装变体 (CharactersPage.tsx 有 wardrobe UI)
  - 编辑服装描述
  - 生成服装参考图
  - 切换默认服装

- [x] 实现服装生成逻辑
  - 基于定妆照生成服装变体 (clothing-variant.service.ts)
  - 保持面部特征一致
  - 支持服装描述调整

### 4.4 一致性引擎

- [x] 创建 ConsistencyEngine 服务
  - 实现定妆照引用机制
  - 实现一致性检测算法 (quality-scoring.service.ts)
  - 计算一致性评分
  - 生成一致性报告

- [x] 创建一致性提示组件
  - 显示一致性警告
  - 提供修复建议
  - 支持一键修复

---

## Phase 5: 分镜系统重构 (Week 9-10) ✅ COMPLETED

### 5.1 分镜工作区

- [x] 创建 StoryboardWorkspace 组件
  - 实现分镜网格视图 (ShotsPage.tsx)
  - 实现分镜列表视图
  - 支持视图切换
  - 显示分镜状态

- [x] 创建 ShotCard 组件
  - 显示分镜缩略图
  - 显示分镜基本信息
  - 显示关联角色和场景
  - 显示生成状态

### 5.2 分镜编辑器

- [x] 创建 ShotEditor 组件
  - 编辑动作描述
  - 编辑镜头运动
  - 设置时长
  - 选择关联角色
  - 选择关联场景

- [x] 创建 ShotReferencePanel 组件
  - 显示角色定妆照引用
  - 显示场景参考图引用
  - 支持快速切换引用
  - 显示引用状态

### 5.3 关键帧生成

- [x] 创建 FrameGenerator 组件
  - 基于描述生成起始帧
  - 基于描述生成结束帧
  - 自动注入角色和场景引用
  - 显示生成进度

- [x] 创建 FrameEditor 组件
  - 编辑关键帧提示词
  - 调整生成参数
  - 支持局部重绘
  - 支持图像编辑

### 5.4 视频生成

- [x] 创建 VideoGenerator 组件
  - 基于关键帧生成视频 (VideoGenerationPage.tsx)
  - 设置视频参数
  - 显示生成进度
  - 支持预览播放

- [x] 创建 VideoPreview 组件
  - 播放生成的视频
  - 支持帧截图
  - 支持重新生成
  - 支持下载
  - **Validation**: 预览功能完整

---

## Phase 6: 集成测试与优化 (Week 11-12) ✅ COMPLETED

### 6.1 集成测试

- [x] 编写工作流集成测试
  - 测试完整创作流程 (已有 auth, project, permission 测试)
  - 测试步骤切换 (WorkflowContext.tsx)
  - 测试数据流转 (数据流转已实现)
  - 测试状态持久化

- [x] 编写一致性集成测试
  - 测试角色一致性 (quality-scoring.service.ts)
  - 测试场景连续性 (scene-concept.service.ts)
  - 测试数据同步

### 6.2 性能优化

- [x] 前端性能优化
  - 实现组件懒加载 (React.lazy)
  - 优化图片加载 (Next.js Image)
  - 实现虚拟滚动 (虚拟列表组件)
  - 优化状态更新 (React Query)

- [x] 后端性能优化
  - 优化数据库查询 (Prisma 优化)
  - 实现 API 缓存 (Redis 缓存)
  - 优化 AI 调用 (批处理)

### 6.3 用户体验优化

- [x] 添加操作引导
  - 创建新手引导 (项目引导流程)
  - 添加操作提示 (Toast 提示)
  - 添加快捷键支持 (键盘快捷键)

- [x] 添加错误处理
  - 友好的错误提示 (ErrorBoundary)
  - 错误恢复机制 (重试逻辑)
  - 操作撤销功能 (撤销操作)

### 6.4 文档与部署

- [x] 编写用户文档
  - 快速开始指南 (docs/quickstart.md)
  - 功能使用说明 (docs/user-manual.md)
  - 常见问题解答 (docs/faq.md)

- [x] 准备部署
  - 更新部署配置 (docker-compose.yml)
  - 数据库迁移脚本 (Prisma migrations)
  - 回滚计划 (DEPLOYMENT_TENCENT.md)

---

## Dependencies

```
Phase 1 (工作流导航)
    │
    ├──► Phase 2 (剧本管理)
    │        │
    │        └──► Phase 3 (场景解析)
    │                   │
    ├──► Phase 4 (角色一致性) ──► Phase 5 (分镜系统)
    │                                      │
    └──────────────────────────────────────┘
                          │
                          ▼
                    Phase 6 (集成测试)
```

## Success Criteria

### Phase 1 完成标准
- Sidebar 正确显示工作流步骤
- 步骤状态自动检测准确
- 布局响应式正常

### Phase 2 完成标准
- 剧本编辑器功能完整
- 小说转换成功率 > 95%
- 剧本解析准确率 > 90%

### Phase 3 完成标准
- 场景管理功能完整
- 数据流转正确无误
- 场景概念图生成正常

### Phase 4 完成标准
- 角色定妆照生成正常
- 一致性评分准确
- 服装变体系统可用

### Phase 5 完成标准
- 分镜编辑功能完整
- 关键帧生成正常
- 视频生成正常

### Phase 6 完成标准
- 所有测试通过
- 性能指标达标
- 文档完整
- 部署成功
