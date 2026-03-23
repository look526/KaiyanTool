## ADDED Requirements

### Requirement: 多轨时间线编辑

系统 SHALL 提供轻量级多轨时间线编辑器，用于对齐和编排视频、配音、BGM、字幕。

#### Scenario: 创建时间线项目
- **WHEN** 用户在某一集的页面点击"打开时间线"
- **THEN** 系统自动创建 `TimelineProject`，将该集所有 Shot 的视频、配音、BGM 加载到对应轨道
- **AND** 按 Shot 顺序自动排列

#### Scenario: 轨道结构
- **WHEN** 时间线打开后
- **THEN** 显示 4 种轨道：视频轨（Shot 视频片段）、配音轨（对白/旁白音频）、BGM 轨（背景音乐）、字幕轨（字幕条）
- **AND** 每个轨道可独立调整

#### Scenario: 拖拽调整
- **WHEN** 用户拖拽轨道中的片段
- **THEN** 可调整片段的起始时间和时长
- **AND** 支持片段间的吸附对齐

### Requirement: 时间线预览

系统 SHALL 支持在时间线中预览合成效果。

#### Scenario: 播放预览
- **WHEN** 用户点击播放按钮
- **THEN** 同步播放视频、配音、BGM，并显示字幕
- **AND** 播放头在时间线上实时移动

#### Scenario: 定位播放
- **WHEN** 用户点击时间线上某个位置
- **THEN** 播放头跳转到该位置
- **AND** 显示该时间点的视频帧和字幕

### Requirement: 音频属性编辑

系统 SHALL 支持在时间线中编辑音频片段的属性。

#### Scenario: 音量调节
- **WHEN** 用户选中一个音频片段并调整音量滑块
- **THEN** 该片段的播放音量相应变化
- **AND** 音量值保存到轨道配置

#### Scenario: 淡入淡出
- **WHEN** 用户为音频片段设置淡入/淡出
- **THEN** 在片段首尾添加渐变效果
- **AND** 合成时 FFmpeg 应用对应的音频滤镜

### Requirement: 时间线合成输出

系统 SHALL 支持将时间线内容合成为最终视频文件。

#### Scenario: 发起合成
- **WHEN** 用户点击"合成输出"
- **THEN** 系统创建 FFmpeg 合成任务，加入 Bull Queue
- **AND** 返回任务 ID，前端通过轮询或 WebSocket 查询进度

#### Scenario: 合成完成
- **WHEN** FFmpeg 合成任务完成
- **THEN** 生成的视频文件上传到存储
- **AND** 更新 `TimelineProject` 的 `output_url` 和 `status`
- **AND** 通知用户合成完成，提供下载链接

#### Scenario: 合成失败
- **WHEN** FFmpeg 合成过程中发生错误
- **THEN** 记录错误信息到 `TimelineProject`
- **AND** 通知用户失败原因，支持重试
