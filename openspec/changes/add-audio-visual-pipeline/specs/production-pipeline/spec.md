## ADDED Requirements

### Requirement: 一键出片 Pipeline

系统 SHALL 提供端到端的自动化生产 Pipeline，从大纲到可发布成片。

#### Scenario: 启动一键出片
- **WHEN** 用户在项目中点击"一键出片"并配置参数（目标集数、风格、质量）
- **THEN** 系统创建 `ProductionTask`，按以下步骤自动执行：
  1. 从大纲提取场景列表
  2. 为每个场景生成分镜（调用 director.agent）
  3. 为每个分镜注入角色参考图并生成图像
  4. 为每个分镜生成视频
  5. 为每个分镜生成 TTS 配音
  6. 为每集生成/匹配 BGM
  7. 生成字幕
  8. 时间线自动排列并合成输出

#### Scenario: 部分出片
- **WHEN** 用户选择仅对某些集执行 Pipeline
- **THEN** 仅处理所选集数，跳过其余集

### Requirement: Pipeline 进度追踪

系统 SHALL 提供实时进度追踪能力。

#### Scenario: 实时进度推送
- **WHEN** Pipeline 执行中
- **THEN** 通过 WebSocket 实时推送：当前步骤名称、总步骤数、已完成百分比、当前处理的 Shot/Scene 信息

#### Scenario: 进度可视化
- **WHEN** 用户查看 Pipeline 面板
- **THEN** 显示步骤流程图，已完成步骤标绿，当前步骤高亮，未开始步骤灰色

### Requirement: Pipeline 错误处理

系统 SHALL 支持 Pipeline 执行中的错误处理和恢复。

#### Scenario: 单步失败不阻塞
- **WHEN** Pipeline 中某个 Shot 的图像生成失败
- **THEN** 记录错误到 `ProductionTask.error_log`
- **AND** 跳过该 Shot 继续处理后续步骤
- **AND** 标记该 Shot 为失败状态

#### Scenario: 手动重试
- **WHEN** Pipeline 完成后存在失败的步骤
- **THEN** 用户可选择失败的 Shot/步骤进行重试
- **AND** 仅重新执行失败的部分

#### Scenario: 暂停和恢复
- **WHEN** 用户点击"暂停 Pipeline"
- **THEN** 等待当前正在执行的任务完成后暂停
- **AND** 用户可随时点击"恢复"继续执行

### Requirement: Pipeline 配置

系统 SHALL 支持灵活的 Pipeline 参数配置。

#### Scenario: 配置生成参数
- **WHEN** 用户启动一键出片前
- **THEN** 可配置：图像风格（写实/动漫/3D）、分辨率、视频时长、TTS 声音、BGM 氛围、字幕样式
- **AND** 配置保存到 `ProductionTask.config`

#### Scenario: 跳过步骤
- **WHEN** 某些步骤已手动完成（如已有分镜图像）
- **THEN** 用户可选择跳过该步骤，Pipeline 直接使用已有资源

### Requirement: ProductionAgent

系统 SHALL 通过 `ProductionAgent` 编排整个生产流程。

#### Scenario: Agent 编排
- **WHEN** ProductionAgent 收到出片任务
- **THEN** 按依赖关系编排子任务，利用 Bull Queue 管理并发
- **AND** 图像生成可并行执行，但时间线合成必须在所有素材就绪后执行
