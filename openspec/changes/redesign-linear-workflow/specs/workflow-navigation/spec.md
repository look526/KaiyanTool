# Spec: Workflow Navigation

## Overview

工作流导航系统提供线性步骤引导，帮助用户完成从剧本到分镜的完整创作流程。

## ADDED Requirements

### Requirement: Linear Workflow Sidebar

The system SHALL provide a linear workflow sidebar that displays all creation steps and allows users to navigate freely.

#### Scenario: Display workflow steps

**Given** 用户进入项目工作区
**When** 页面加载完成
**Then** Sidebar 显示四个主要步骤：剧本、角色、场景、分镜
**And** 每个步骤显示当前状态图标（待处理/进行中/已完成）

#### Scenario: Navigate between steps

**Given** 用户在任意步骤
**When** 点击 Sidebar 中的其他步骤
**Then** 主内容区切换到对应步骤的工作区
**And** 当前步骤状态更新为"进行中"

#### Scenario: Auto-detect step completion

**Given** 用户完成了某个步骤的内容
**When** 系统检测到内容满足完成条件
**Then** 步骤状态自动更新为"已完成"
**And** 显示完成图标

---

### Requirement: Workflow State Management

The system MUST manage workflow state and support state persistence and recovery.

#### Scenario: Persist workflow state

**Given** 用户在工作流中进行操作
**When** 步骤状态发生变化
**Then** 状态自动保存到本地存储
**And** 刷新页面后状态恢复

#### Scenario: Track workflow progress

**Given** 用户在工作流中
**When** 查看进度指示器
**Then** 显示整体完成百分比
**And** 显示当前步骤名称

---

### Requirement: Step Completion Validation

The system SHALL validate each step completion with clear criteria and automatic verification.

#### Scenario: Validate script step

**Given** 用户在剧本步骤
**When** 剧本内容字数 > 100
**Then** 步骤标记为可完成
**And** 显示"下一步"提示

#### Scenario: Validate character step

**Given** 用户在角色步骤
**When** 至少有一个角色且该角色有定妆照
**Then** 步骤标记为可完成

#### Scenario: Validate scene step

**Given** 用户在场景步骤
**When** 至少有一个场景
**Then** 步骤标记为可完成

#### Scenario: Validate storyboard step

**Given** 用户在分镜步骤
**When** 至少有一个分镜
**Then** 步骤标记为可完成

---

## Data Model

```typescript
interface WorkflowState {
  projectId: string;
  currentStep: 'script' | 'characters' | 'scenes' | 'storyboard';
  completedSteps: string[];
  stepProgress: {
    script: StepProgress;
    characters: StepProgress;
    scenes: StepProgress;
    storyboard: StepProgress;
  };
  lastUpdated: Date;
}

interface StepProgress {
  status: 'pending' | 'in_progress' | 'completed';
  percentage: number;
  lastVisited: Date;
}
```

## UI Components

- `WorkflowSidebar`: 主侧边栏组件
- `WorkflowStepItem`: 单个步骤项
- `StepProgressIndicator`: 步骤进度指示器
- `WorkflowProvider`: 状态管理 Provider

## Related Capabilities

- [script-management](../script-management/spec.md)
- [character-consistency](../character-consistency/spec.md)
- [scene-parsing](../scene-parsing/spec.md)
- [storyboard-system](../storyboard-system/spec.md)
