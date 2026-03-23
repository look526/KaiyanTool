## ADDED Requirements

### Requirement: BGM AI 生成

系统 SHALL 支持根据场景氛围描述 AI 生成背景音乐。

#### Scenario: 按氛围生成 BGM
- **WHEN** 用户输入氛围描述（如"紧张悬疑"、"温馨浪漫"）或由系统自动分析场景氛围
- **THEN** 调用 BGM Provider 生成符合氛围的背景音乐
- **AND** 生成的音频存储为 `AudioTrack`（type=bgm）

#### Scenario: AI 自动分析场景氛围
- **WHEN** 用户点击"自动匹配 BGM"
- **THEN** 系统分析该集/场景的剧本内容，提取氛围关键词
- **AND** 基于关键词自动生成或推荐 BGM

### Requirement: 音效匹配

系统 SHALL 支持根据场景内容匹配音效。

#### Scenario: 自动推荐音效
- **WHEN** 场景描述中包含音效相关内容（如"门声"、"雨声"、"爆炸"）
- **THEN** 系统从音效库中匹配对应音效
- **AND** 展示推荐音效列表供用户选择

#### Scenario: 手动添加音效
- **WHEN** 用户在音效面板中搜索或浏览音效
- **THEN** 可将音效添加到指定时间点
- **AND** 存储为 `AudioTrack`（type=sfx）

### Requirement: BGM 管理

系统 SHALL 提供 BGM 资源管理能力。

#### Scenario: BGM 上传
- **WHEN** 用户上传自有 BGM 文件
- **THEN** 存储到资产库，关联项目

#### Scenario: BGM 库浏览
- **WHEN** 用户打开 BGM 选择面板
- **THEN** 展示 AI 生成的 BGM + 上传的 BGM + 推荐的 BGM
- **AND** 支持按氛围标签筛选和试听

### Requirement: BGM Provider 抽象

系统 SHALL 通过 `providerManager` 支持多种 BGM 生成后端。

#### Scenario: 注册 BGM Provider
- **WHEN** 管理员在 AI 提供商设置中添加 BGM 类型的 Provider
- **THEN** 系统将其注册到 `providerManager`
- **AND** 可通过统一接口调用 BGM 生成
