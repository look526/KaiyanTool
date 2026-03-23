# Shot NineGrid Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在分镜详情工作台中内嵌九宫格细化区，并打通面板回填开始帧/结束帧的闭环。

**Architecture:** 复用现有九宫格 API，在 `EpisodeDetailPage` 下新增一个轻量内嵌组件承接面板 CRUD 与批量生成。分镜关键帧回填只更新当前页面编辑态，最终仍由现有分镜保存接口统一落库。

**Tech Stack:** React、TypeScript、现有 `apiClient`、内联样式与 CSS 变量

---

### Task 1: 文档与接口梳理

**Files:**
- Modify: `docs/plans/2026-03-19-shot-ninegrid-design.md`
- Create: `docs/plans/2026-03-19-shot-ninegrid-implementation.md`

**Step 1: 确认九宫格接口能力**
Run: 搜索前后端九宫格接口与页面实现
Expected: 明确 CRUD、批量创建、批量生成、回填链路都可复用

**Step 2: 固化一期范围**
Run: 将实现目标写入文档
Expected: 文档明确只做内嵌工作台与关键帧回填

### Task 2: 内嵌九宫格组件

**Files:**
- Create: `apps/web/src/components/episode/ShotNineGridWorkbench.tsx`
- Modify: `apps/web/src/lib/panelUtils.ts`

**Step 1: 建立九宫格数据映射与状态管理**
Expected: 支持 `snake_case`/`camelCase` 响应兼容

**Step 2: 实现面板列表与选中编辑区**
Expected: 支持新增、保存、删除、批量创建 9 格

**Step 3: 实现批量生成与关键帧回填按钮**
Expected: 可将面板图像回填到开始帧或结束帧

### Task 3: 分镜详情页接入

**Files:**
- Modify: `apps/web/src/pages/EpisodeDetailPage.tsx`

**Step 1: 挂载九宫格组件**
Expected: 仅在当前激活分镜下展示内嵌九宫格区

**Step 2: 接通回填到编辑态**
Expected: 回填后无需额外接口，继续走现有保存分镜流程

### Task 4: 验证与提交

**Files:**
- Modify: `apps/web/src/pages/EpisodeDetailPage.tsx`
- Modify: `apps/web/src/components/episode/ShotNineGridWorkbench.tsx`

**Step 1: 运行类型检查或最小构建验证**
Run: 前端 TypeScript 校验
Expected: 无新增类型错误

**Step 2: 浏览器验证工作流**
Run: 打开分镜详情页并验证创建、生成、回填
Expected: 页面正常工作，无阻塞错误

**Step 3: 提交改动**
Run: 按当前仓库风格提交
Expected: 当前分支包含九宫格接入与前置同步改动
