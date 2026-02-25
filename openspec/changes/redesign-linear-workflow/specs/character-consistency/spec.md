# Spec: Character Consistency

## Overview

角色一致性系统确保角色在所有场景和分镜中保持视觉和描述的一致性，采用"定妆照优先"策略。

## ADDED Requirements

### Requirement: Character Portrait Generation

The system SHALL require users to generate character portraits as the reference baseline for subsequent generation.

#### Scenario: Generate portrait from description

**Given** 角色已创建且有外貌描述
**When** 点击"生成定妆照"
**Then** AI 基于描述生成角色图像
**And** 显示多个候选结果
**And** 用户可选择最佳结果

#### Scenario: Select and lock portrait

**Given** 定妆照候选已生成
**When** 用户选择一张并确认
**Then** 定妆照被锁定
**And** 后续生成必须基于此定妆照
**And** 显示锁定状态

#### Scenario: Regenerate portrait

**Given** 定妆照已锁定
**When** 用户需要重新生成
**Then** 需要先解锁
**And** 确认后可重新生成
**And** 保留历史版本

---

### Requirement: Character Definition

The system MUST allow users to define character information and extract characters from scripts.

#### Scenario: Create character manually

**Given** 用户在角色步骤
**When** 点击"添加角色"
**Then** 显示角色创建表单
**And** 填写角色基本信息
**And** 填写外貌描述

#### Scenario: Extract characters from script

**Given** 剧本已解析
**When** 用户点击"从剧本提取"
**Then** 显示提取的角色列表
**And** 可选择创建哪些角色
**And** 自动填充角色描述

#### Scenario: Edit character details

**Given** 角色已创建
**When** 用户编辑角色
**Then** 可修改基本信息
**And** 可修改外貌描述
**And** 修改后提示更新定妆照

---

### Requirement: Wardrobe System

The system SHALL allow users to manage character wardrobe variants while maintaining facial feature consistency.

#### Scenario: Add wardrobe variant

**Given** 角色有定妆照
**When** 点击"添加服装"
**Then** 填写服装描述
**And** 基于定妆照生成服装变体
**And** 保持面部特征一致

#### Scenario: Switch wardrobe

**Given** 角色有多个服装
**When** 在分镜中选择角色
**Then** 可选择使用哪个服装
**And** 服装变体作为生成参考

#### Scenario: Generate wardrobe image

**Given** 服装描述已填写
**When** 点击"生成服装图"
**Then** 基于定妆照生成服装变体图
**And** 面部特征与定妆照一致
**And** 服装符合描述

---

### Requirement: Consistency Engine

The system MUST detect and ensure character consistency across all generated content.

#### Scenario: Inject portrait reference

**Given** 分镜关联了角色
**When** 生成关键帧
**Then** 自动注入角色定妆照作为参考
**And** 生成的图像保持角色特征

#### Scenario: Detect consistency

**Given** 图像已生成
**When** 系统执行一致性检测
**Then** 对比生成图像与定妆照
**And** 计算相似度分数
**And** 低于阈值时发出警告

#### Scenario: Consistency warning

**Given** 检测到不一致
**When** 相似度低于 70%
**Then** 显示警告提示
**And** 提供重新生成选项
**And** 提供手动调整选项

---

### Requirement: Character Reference in Storyboard

The system SHALL ensure the storyboard system correctly references character information.

#### Scenario: Select character for shot

**Given** 创建或编辑分镜
**When** 选择出场角色
**Then** 显示角色列表
**And** 显示角色定妆照缩略图
**And** 显示可用服装变体

#### Scenario: Auto-apply character reference

**Given** 分镜已选择角色
**When** 生成关键帧
**Then** 自动应用角色定妆照
**And** 自动应用选择的服装
**And** Prompt 包含角色描述

---

## Data Model

```typescript
interface Character {
  id: string;
  projectId: string;
  name: string;
  age?: number;
  gender?: string;
  description: string;
  appearance: string;
  personality?: string;
  portrait: CharacterPortrait;
  wardrobes: Wardrobe[];
  consistencyScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CharacterPortrait {
  id: string;
  characterId: string;
  imageUrl: string;
  prompt: string;
  negativePrompt: string;
  model: string;
  isLocked: boolean;
  versions: PortraitVersion[];
  createdAt: Date;
}

interface PortraitVersion {
  id: string;
  imageUrl: string;
  createdAt: Date;
}

interface Wardrobe {
  id: string;
  characterId: string;
  name: string;
  description: string;
  imageUrl?: string;
  isDefault: boolean;
  createdAt: Date;
}

interface ConsistencyReport {
  id: string;
  characterId: string;
  shotId: string;
  generatedImageUrl: string;
  portraitImageUrl: string;
  similarityScore: number;
  isConsistent: boolean;
  issues: string[];
  createdAt: Date;
}
```

## API Endpoints

- `GET /api/projects/:id/characters` - 获取角色列表
- `POST /api/projects/:id/characters` - 创建角色
- `PUT /api/characters/:id` - 更新角色
- `DELETE /api/characters/:id` - 删除角色
- `POST /api/characters/:id/portrait/generate` - 生成定妆照
- `POST /api/characters/:id/portrait/lock` - 锁定定妆照
- `POST /api/characters/:id/portrait/unlock` - 解锁定妆照
- `POST /api/characters/:id/wardrobes` - 添加服装
- `PUT /api/wardrobes/:id` - 更新服装
- `DELETE /api/wardrobes/:id` - 删除服装
- `POST /api/wardrobes/:id/generate` - 生成服装图
- `GET /api/characters/:id/consistency` - 获取一致性报告

## UI Components

- `CharactersWorkspace`: 角色工作区
- `CharacterList`: 角色列表
- `CharacterCard`: 角色卡片
- `CharacterEditor`: 角色编辑器
- `PortraitGenerator`: 定妆照生成器
- `PortraitSelector`: 定妆照选择器
- `WardrobeManager`: 服装管理器
- `ConsistencyWarning`: 一致性警告

## Related Capabilities

- [script-management](../script-management/spec.md)
- [storyboard-system](../storyboard-system/spec.md)
