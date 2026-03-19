## ADDED Requirements

### Requirement: 口型同步生成

系统 SHALL 支持将角色面部图像与配音音频合成口型同步视频。

#### Scenario: 单 Shot 口型同步
- **WHEN** 用户对一个已有配音和起始帧图像的 Shot 点击"生成口型同步"
- **THEN** 系统将 Shot 的 `start_image_url`（角色面部）和 `audio_url`（配音）发送到 LipSync Provider
- **AND** 生成口型同步视频，URL 存储到 Shot 的 `lip_sync_url`

#### Scenario: 批量口型同步
- **WHEN** 用户在集详情页点击"批量口型同步"
- **THEN** 系统筛选所有有配音且有角色面部图像的 Shot
- **AND** 逐个生成口型同步视频，推送进度

#### Scenario: 无面部图像退化
- **WHEN** Shot 的起始帧不包含清晰的角色面部
- **THEN** 跳过口型同步，保留原始视频

### Requirement: LipSync Provider 抽象

系统 SHALL 通过 `providerManager` 支持多种口型同步后端。

#### Scenario: 注册 LipSync Provider
- **WHEN** 管理员配置 LipSync 类型的 Provider（如 SadTalker、MuseTalk）
- **THEN** 注册到 `providerManager`，通过统一接口调用

#### Scenario: Provider 调用
- **WHEN** 服务层调用 `lipSyncProvider.generate(imageUrl, audioUrl, options)`
- **THEN** Provider 将请求转发到对应模型 API
- **AND** 返回生成的视频文件 URL

### Requirement: 口型同步预览

系统 SHALL 支持口型同步视频的预览对比。

#### Scenario: 对比预览
- **WHEN** Shot 同时有原始视频和口型同步视频
- **THEN** 用户可在 Shot 卡片中切换查看两个版本
- **AND** 选择使用哪个版本参与最终合成
