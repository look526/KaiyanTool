# Spec: Script Management

## Overview

剧本管理模块提供统一的剧本编辑器，支持剧本创作、小说导入转换、剧本解析等功能。

## ADDED Requirements

### Requirement: Unified Script Editor

The system SHALL provide a unified script editor that supports script creation and novel import conversion.

#### Scenario: Create new script

**Given** 用户进入剧本步骤
**When** 开始创作新剧本
**Then** 显示空白编辑器
**And** 提供剧本模板选择（标准剧本、电影剧本）

#### Scenario: Edit existing script

**Given** 项目已有剧本内容
**When** 用户进入剧本步骤
**Then** 显示已有剧本内容
**And** 支持继续编辑

#### Scenario: Auto-save script

**Given** 用户正在编辑剧本
**When** 内容发生变化后 3 秒
**Then** 自动保存到服务器
**And** 显示保存状态

---

### Requirement: Novel Import and Conversion

The system MUST support novel import and automatic conversion to script format.

#### Scenario: Import novel text

**Given** 用户点击"导入小说"
**When** 粘贴或上传小说文本
**Then** 显示导入预览
**And** 显示转换按钮

#### Scenario: Convert novel to script

**Given** 小说内容已导入
**When** 点击"转换为剧本"
**Then** 调用 AI 服务进行转换
**And** 显示转换进度
**And** 转换完成后显示结果

#### Scenario: Edit conversion result

**Given** 小说转换完成
**When** 用户查看转换结果
**Then** 可对比原文和转换结果
**And** 可手动编辑调整
**And** 可重新转换

---

### Requirement: Script Parsing

The system SHALL automatically parse script content and extract scene and character information.

#### Scenario: Parse script automatically

**Given** 剧本内容已保存
**When** 用户点击"解析剧本"
**Then** 系统解析剧本结构
**And** 提取场景列表
**And** 提取角色列表

#### Scenario: Review parsed results

**Given** 剧本解析完成
**When** 用户查看解析结果
**Then** 显示场景列表预览
**And** 显示角色列表预览
**And** 可手动调整解析结果

#### Scenario: Create scenes from script

**Given** 解析结果已确认
**When** 用户确认创建
**Then** 自动创建场景数据
**And** 自动创建角色数据
**And** 建立数据关联

---

### Requirement: Script Version History

The system MUST record script modification history and support version rollback.

#### Scenario: View version history

**Given** 剧本有多次修改
**When** 用户点击"历史版本"
**Then** 显示版本列表
**And** 每个版本显示修改时间和摘要

#### Scenario: Restore previous version

**Given** 用户查看历史版本
**When** 选择某个版本并点击"恢复"
**Then** 剧本内容恢复到该版本
**And** 创建新的版本记录

---

## MODIFIED Requirements

### Requirement: AI Script Assistance

The system SHALL extend existing AI functionality to enhance script creation assistance.

#### Scenario: AI continue script

**Given** 用户正在编辑剧本
**When** 点击"AI 续写"
**Then** AI 根据上下文续写内容
**And** 显示续写结果供选择

#### Scenario: AI rewrite script

**Given** 用户选中部分剧本内容
**When** 点击"AI 改写"
**Then** AI 改写选中内容
**And** 显示改写对比

---

## Data Model

```typescript
interface Script {
  id: string;
  projectId: string;
  content: string;
  format: 'standard' | 'novel' | 'screenplay';
  wordCount: number;
  parsedData?: ParsedScriptData;
  versions: ScriptVersion[];
  createdAt: Date;
  updatedAt: Date;
}

interface ParsedScriptData {
  scenes: ParsedScene[];
  characters: ParsedCharacter[];
  parsedAt: Date;
}

interface ParsedScene {
  id: string;
  index: number;
  title: string;
  content: string;
  location: string;
  timeOfDay: string;
  characters: string[];
}

interface ParsedCharacter {
  id: string;
  name: string;
  description: string;
  appearances: number;
}

interface ScriptVersion {
  id: string;
  content: string;
  summary: string;
  createdAt: Date;
}
```

## API Endpoints

- `GET /api/projects/:id/script` - 获取剧本
- `PUT /api/projects/:id/script` - 更新剧本
- `POST /api/projects/:id/script/parse` - 解析剧本
- `POST /api/projects/:id/script/convert-novel` - 小说转剧本
- `GET /api/projects/:id/script/versions` - 获取版本历史
- `POST /api/projects/:id/script/restore/:versionId` - 恢复版本

## UI Components

- `ScriptWorkspace`: 剧本工作区
- `ScriptEditor`: 剧本编辑器
- `ScriptToolbar`: 工具栏
- `ScriptPreview`: 预览面板
- `NovelImporter`: 小说导入器
- `VersionHistory`: 版本历史

## Related Capabilities

- [workflow-navigation](../workflow-navigation/spec.md)
- [scene-parsing](../scene-parsing/spec.md)
- [character-consistency](../character-consistency/spec.md)
