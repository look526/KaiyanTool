# Spec: Scene Parsing

## Overview

场景解析模块负责从剧本中提取场景信息，管理场景数据，并支持场景概念图生成。

## ADDED Requirements

### Requirement: Intelligent Scene Parsing

The system SHALL intelligently parse scripts and automatically extract scene information.

#### Scenario: Parse scene structure

**Given** 剧本内容已输入
**When** 执行场景解析
**Then** 识别所有场景段落
**And** 提取场景标题
**And** 提取场景位置（室内/室外）
**And** 提取时间段（白天/夜晚）

#### Scenario: Extract scene characters

**Given** 场景已识别
**When** 解析场景内容
**Then** 提取出场角色列表
**And** 统计角色对话数量
**And** 识别角色动作描述

#### Scenario: Handle multiple formats

**Given** 剧本使用不同格式
**When** 执行场景解析
**Then** 支持标准剧本格式
**And** 支持电影剧本格式（INT./EXT.）
**And** 支持自定义格式

---

### Requirement: Scene Management

The system MUST allow users to manage parsed scenes with editing and adjustment capabilities.

#### Scenario: View scene list

**Given** 场景已解析
**When** 用户进入场景步骤
**Then** 显示场景列表
**And** 每个场景显示基本信息
**And** 显示关联角色

#### Scenario: Edit scene details

**Given** 用户选择某个场景
**When** 点击编辑
**Then** 打开场景编辑器
**And** 可修改场景名称
**And** 可修改场景描述
**And** 可修改时间和氛围

#### Scenario: Merge scenes

**Given** 用户选择多个相邻场景
**When** 点击合并
**Then** 场景合并为一个
**And** 内容按顺序组合
**And** 角色列表合并

#### Scenario: Split scene

**Given** 用户选择某个场景
**When** 点击拆分
**Then** 可选择拆分点
**And** 场景拆分为两个
**And** 内容分别归属

---

### Requirement: Scene Concept Generation

The system SHALL support scene concept reference image generation for users.

#### Scenario: Generate scene concept

**Given** 场景已创建
**When** 点击"生成概念图"
**Then** 基于场景描述生成图像
**And** 显示生成进度
**And** 生成完成后显示结果

#### Scenario: Generate multiple angles

**Given** 场景概念图已生成
**When** 点击"生成其他角度"
**Then** 可选择角度（全景/中景/特写）
**And** 生成对应角度图像
**And** 保存为场景参考图

#### Scenario: Use scene reference in shots

**Given** 场景有参考图
**When** 创建该场景的分镜
**Then** 自动引用场景参考图
**And** 保持光影一致性

---

### Requirement: Scene Data Flow

The system MUST ensure correct data flow between scenes and other modules.

#### Scenario: Sync with script changes

**Given** 剧本内容被修改
**When** 修改影响场景结构
**Then** 提示用户更新场景
**And** 可选择自动同步或手动调整

#### Scenario: Link to storyboard

**Given** 场景已创建
**When** 创建分镜
**Then** 分镜自动关联场景
**And** 场景信息传递到分镜
**And** 场景参考图传递到分镜

---

## Data Model

```typescript
interface Scene {
  id: string;
  projectId: string;
  scriptId?: string;
  name: string;
  description: string;
  location: 'interior' | 'exterior' | 'mixed';
  timeOfDay: 'day' | 'night' | 'dawn' | 'dusk' | 'unspecified';
  atmosphere?: string;
  content?: string;
  characterIds: string[];
  referenceImages: SceneReferenceImage[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SceneReferenceImage {
  id: string;
  sceneId: string;
  imageUrl: string;
  prompt: string;
  angle: 'wide' | 'medium' | 'close';
  isPrimary: boolean;
  createdAt: Date;
}
```

## API Endpoints

- `GET /api/projects/:id/scenes` - 获取场景列表
- `POST /api/projects/:id/scenes` - 创建场景
- `PUT /api/scenes/:id` - 更新场景
- `DELETE /api/scenes/:id` - 删除场景
- `POST /api/scenes/:id/merge` - 合并场景
- `POST /api/scenes/:id/split` - 拆分场景
- `POST /api/scenes/:id/concept` - 生成概念图
- `GET /api/scenes/:id/references` - 获取参考图

## UI Components

- `ScenesWorkspace`: 场景工作区
- `SceneList`: 场景列表
- `SceneCard`: 场景卡片
- `SceneEditor`: 场景编辑器
- `SceneConceptGenerator`: 概念图生成器

## Related Capabilities

- [script-management](../script-management/spec.md)
- [storyboard-system](../storyboard-system/spec.md)
