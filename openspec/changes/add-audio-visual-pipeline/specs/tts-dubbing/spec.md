## ADDED Requirements

### Requirement: TTS 配音合成

系统 SHALL 提供 AI 文字转语音（TTS）服务，支持将角色对白和旁白文本转换为语音音频。

#### Scenario: 单条对白配音
- **WHEN** 用户选择一个 Shot 并点击"生成配音"
- **THEN** 系统使用该 Shot 关联角色绑定的声音档案（VoiceProfile）合成语音
- **AND** 生成的音频 URL 存储到 `AudioTrack` 表，并更新 Shot 的 `audio_url` 字段
- **AND** 返回音频时长（毫秒）

#### Scenario: 批量配音
- **WHEN** 用户在 EpisodeDetailPage 点击"批量生成配音"
- **THEN** 系统按 Shot 顺序逐条生成配音，跳过无对白的 Shot
- **AND** 通过 WebSocket 推送每条 Shot 的生成进度

#### Scenario: 旁白生成
- **WHEN** Shot 的 `subtitle_text` 标记为旁白类型且无关联角色
- **THEN** 系统使用项目默认旁白声音生成语音

### Requirement: 声音档案管理

系统 SHALL 提供声音档案（VoiceProfile）管理能力，支持为角色绑定特定声音。

#### Scenario: 创建声音档案
- **WHEN** 用户在角色设置中选择"配置声音"
- **THEN** 展示可用声音列表（从 TTS Provider 获取）
- **AND** 用户可试听并绑定声音到角色
- **AND** 绑定关系存储到 `VoiceProfile` 表

#### Scenario: 声音试听
- **WHEN** 用户点击某个声音的试听按钮
- **THEN** 系统使用样本文本调用 TTS Provider 合成一段试听音频并播放

### Requirement: TTS Provider 抽象

系统 SHALL 通过 `providerManager` 支持多种 TTS 后端，Provider 类型标识为 `tts`。

#### Scenario: 注册 TTS Provider
- **WHEN** 管理员在 AI 提供商设置中添加 TTS 类型的 Provider（如火山引擎）
- **THEN** 系统将其注册到 `providerManager`，可通过统一接口调用

#### Scenario: TTS Provider 调用
- **WHEN** 服务层调用 `ttsProvider.synthesize(text, options)`
- **THEN** Provider 实现将请求转发到对应的第三方 TTS API
- **AND** 返回音频文件（Buffer 或 URL）

### Requirement: 情感配音

系统 SHALL 支持在 TTS 合成时指定情感参数，以匹配剧情氛围。

#### Scenario: AI 自动分析情感
- **WHEN** 生成配音时未手动指定情感
- **THEN** 系统使用 AI 分析对白文本的情感倾向（开心/悲伤/愤怒/中性/兴奋）
- **AND** 将分析结果作为 TTS 的 emotion 参数传入

#### Scenario: 手动指定情感
- **WHEN** 用户在 Shot 配音设置中手动选择情感
- **THEN** 使用用户指定的情感参数，覆盖 AI 分析结果
