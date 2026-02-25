# Spec: Storyboard System

## Overview

分镜系统是工作流的最终步骤，基于剧本、角色和场景信息创建分镜，生成关键帧和视频。

## ADDED Requirements

### Requirement: Storyboard Workspace

The system SHALL provide a unified workspace for users to manage all storyboards.

#### Scenario: View storyboard grid

**Given** 用户进入分镜步骤
**When** 页面加载完成
**Then** 显示分镜网格视图
**And** 每个分镜显示缩略图和基本信息
**And** 显示分镜状态（空/有图/有视频）

#### Scenario: View storyboard list

**Given** 用户在分镜步骤
**When** 切换到列表视图
**Then** 显示分镜列表
**And** 显示更详细的信息
**And** 支持批量操作

#### Scenario: Sort shots

**Given** 分镜已创建
**When** 用户拖拽分镜
**Then** 分镜顺序更新
**And** 保存新的排序

---

### Requirement: Shot Creation and Editing

The system MUST allow users to create and edit shot content.

#### Scenario: Create shot manually

**Given** 用户在分镜步骤
**When** 点击"添加分镜"
**Then** 创建新的分镜
**And** 打开分镜编辑器

#### Scenario: Generate shots from script

**Given** 剧本已解析
**When** 点击"从剧本生成分镜"
**Then** AI 分析剧本内容
**And** 自动创建分镜列表
**And** 填充基本信息

#### Scenario: Edit shot details

**Given** 分镜已创建
**When** 用户点击编辑
**Then** 打开分镜编辑器
**And** 可编辑动作描述
**And** 可编辑镜头运动
**And** 可设置时长

---

### Requirement: Character and Scene Reference

The system SHALL ensure shots correctly reference character and scene information.

#### Scenario: Select characters for shot

**Given** 编辑分镜
**When** 选择出场角色
**Then** 显示角色列表和定妆照
**And** 可选择多个角色
**And** 可选择服装变体

#### Scenario: Select scene for shot

**Given** 编辑分镜
**When** 选择场景
**Then** 显示场景列表和参考图
**And** 选择后自动关联
**And** 场景信息传递到分镜

#### Scenario: View references panel

**Given** 分镜已关联角色和场景
**When** 查看引用面板
**Then** 显示角色定妆照
**And** 显示场景参考图
**And** 显示服装选择

---

### Requirement: Keyframe Generation

The system MUST allow users to generate keyframes for shots.

#### Scenario: Generate start frame

**Given** 分镜有动作描述
**When** 点击"生成起始帧"
**Then** 自动注入角色和场景参考
**And** 调用 AI 生成图像
**And** 显示生成进度
**And** 生成完成后显示结果

#### Scenario: Generate end frame

**Given** 起始帧已生成
**When** 点击"生成结束帧"
**Then** 基于起始帧和动作描述生成
**And** 保持角色和场景一致性
**And** 显示生成结果

#### Scenario: Regenerate frame

**Given** 关键帧已生成
**When** 点击"重新生成"
**Then** 可修改提示词
**And** 重新生成图像
**And** 保留历史版本

#### Scenario: Edit frame prompt

**Given** 关键帧已生成
**When** 点击"编辑提示词"
**Then** 显示当前提示词
**And** 可手动修改
**And** 修改后可重新生成

---

### Requirement: Video Generation

The system SHALL allow users to generate videos from keyframes.

#### Scenario: Generate video from frames

**Given** 起始帧和结束帧已生成
**When** 点击"生成视频"
**Then** 调用 AI 视频生成服务
**And** 显示生成进度
**And** 生成完成后显示结果

#### Scenario: Generate video from single frame

**Given** 只有起始帧
**When** 点击"生成视频"
**Then** 基于单帧生成视频
**And** 应用镜头运动效果
**And** 显示生成结果

#### Scenario: Preview video

**Given** 视频已生成
**When** 点击播放
**Then** 在预览器中播放视频
**And** 支持暂停/继续
**And** 支持帧截图

#### Scenario: Download video

**Given** 视频已生成
**When** 点击下载
**Then** 下载视频文件
**And** 支持选择格式（MP4/WebM）

---

### Requirement: Batch Operations

The system MUST support batch operations for multiple shots.

#### Scenario: Batch generate frames

**Given** 选择多个分镜
**When** 点击"批量生成关键帧"
**Then** 添加到生成队列
**And** 按顺序生成
**And** 显示整体进度

#### Scenario: Batch generate videos

**Given** 多个分镜有关键帧
**When** 点击"批量生成视频"
**Then** 添加到生成队列
**And** 按顺序生成
**And** 显示整体进度

#### Scenario: Cancel batch operation

**Given** 批量操作进行中
**When** 点击"取消"
**Then** 停止当前生成
**And** 取消队列中的任务
**And** 保留已生成的结果

---

## MODIFIED Requirements

### Requirement: Shot Data Model

The system SHALL extend the shot data model to support character and scene references.

#### Scenario: Store character references

**Given** 分镜选择了角色
**When** 保存分镜
**Then** 存储角色 ID 列表
**And** 存储服装选择
**And** 建立关联关系

#### Scenario: Store scene reference

**Given** 分镜选择了场景
**When** 保存分镜
**Then** 存储场景 ID
**And** 建立关联关系

---

## Data Model

```typescript
interface Shot {
  id: string;
  projectId: string;
  sceneId?: string;
  characterIds: string[];
  wardrobeSelections: { characterId: string; wardrobeId: string }[];
  order: number;
  actionDescription: string;
  cameraMovement?: string;
  duration: number;
  aspectRatio: string;
  visualStyle?: string;
  startFrame?: Frame;
  endFrame?: Frame;
  videoUrl?: string;
  videoStatus?: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

interface Frame {
  id: string;
  shotId: string;
  type: 'start' | 'end';
  imageUrl: string;
  prompt: string;
  characterReferences: string[];
  sceneReference?: string;
  generatedAt: Date;
  model: string;
}

interface GenerationQueue {
  id: string;
  projectId: string;
  type: 'frame' | 'video';
  shotIds: string[];
  status: 'pending' | 'running' | 'completed' | 'cancelled';
  progress: number;
  createdAt: Date;
}
```

## API Endpoints

- `GET /api/projects/:id/shots` - 获取分镜列表
- `POST /api/projects/:id/shots` - 创建分镜
- `PUT /api/shots/:id` - 更新分镜
- `DELETE /api/shots/:id` - 删除分镜
- `POST /api/projects/:id/shots/generate-from-script` - 从剧本生成
- `POST /api/shots/:id/start-frame/generate` - 生成起始帧
- `POST /api/shots/:id/end-frame/generate` - 生成结束帧
- `POST /api/shots/:id/video/generate` - 生成视频
- `POST /api/projects/:id/shots/batch-frames` - 批量生成关键帧
- `POST /api/projects/:id/shots/batch-videos` - 批量生成视频
- `GET /api/projects/:id/generation-queue` - 获取生成队列

## UI Components

- `StoryboardWorkspace`: 分镜工作区
- `ShotGrid`: 分镜网格
- `ShotList`: 分镜列表
- `ShotCard`: 分镜卡片
- `ShotEditor`: 分镜编辑器
- `ReferencePanel`: 引用面板
- `FrameGenerator`: 关键帧生成器
- `FrameEditor`: 关键帧编辑器
- `VideoGenerator`: 视频生成器
- `VideoPreview`: 视频预览器
- `BatchOperations`: 批量操作面板
- `GenerationProgress`: 生成进度

## Related Capabilities

- [workflow-navigation](../workflow-navigation/spec.md)
- [scene-parsing](../scene-parsing/spec.md)
- [character-consistency](../character-consistency/spec.md)
