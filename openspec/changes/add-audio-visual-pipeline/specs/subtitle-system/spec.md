## ADDED Requirements

### Requirement: 字幕自动生成

系统 SHALL 支持从剧本对白或配音音频自动生成时间轴字幕。

#### Scenario: 从剧本生成字幕
- **WHEN** 用户点击"从剧本生成字幕"
- **THEN** 系统提取每个 Shot 的 `subtitle_text`，按 TTS 音频时长自动分配时间戳
- **AND** 生成 `Subtitle` 记录，entries 中包含每条字幕的 start_time、end_time、text、speaker

#### Scenario: 从音频 ASR 对齐字幕
- **WHEN** 用户选择"精准模式"生成字幕
- **THEN** 系统对每个 Shot 的配音音频执行 ASR（语音识别）
- **AND** 获取字级时间戳，生成精准对齐的字幕

#### Scenario: 无配音时生成字幕
- **WHEN** Shot 尚未生成配音但有 `subtitle_text`
- **THEN** 系统按文字数量和默认语速估算时间戳

### Requirement: 字幕编辑

系统 SHALL 提供字幕可视化编辑能力。

#### Scenario: 时间轴拖拽调整
- **WHEN** 用户在字幕编辑器中拖拽字幕条
- **THEN** 更新该字幕条的 start_time 和 end_time
- **AND** 实时预览字幕在视频上的显示效果

#### Scenario: 文本编辑
- **WHEN** 用户双击字幕条编辑文本
- **THEN** 修改字幕文本内容并保存

### Requirement: 字幕样式配置

系统 SHALL 支持自定义字幕显示样式。

#### Scenario: 配置字幕样式
- **WHEN** 用户在字幕样式面板中调整参数
- **THEN** 可配置：字体、字号、颜色、描边、阴影、位置（上/中/下）、对齐方式
- **AND** 样式配置保存到 Subtitle 的 `style` 字段

#### Scenario: 角色区分样式
- **WHEN** 字幕对应不同角色的对白
- **THEN** 可为不同角色设置不同颜色，便于观众区分说话人

### Requirement: 字幕导出

系统 SHALL 支持将字幕导出为标准格式文件。

#### Scenario: 导出 SRT 格式
- **WHEN** 用户选择导出格式为 SRT
- **THEN** 生成符合 SRT 规范的字幕文件供下载

#### Scenario: 导出 ASS 格式
- **WHEN** 用户选择导出格式为 ASS
- **THEN** 生成包含样式信息的 ASS 字幕文件
