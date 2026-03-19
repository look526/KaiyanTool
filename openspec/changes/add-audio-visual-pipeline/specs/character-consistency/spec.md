## ADDED Requirements

### Requirement: 角色参考图自动注入

系统 SHALL 在生成分镜图像时，自动将关联角色的参考图注入到图像生成请求中。

#### Scenario: 分镜图像生成自动注入
- **WHEN** `shot-generation.controller` 生成 Shot 的起始帧/结束帧图像
- **AND** 该 Shot 关联了 Character（`character_id` 不为空）
- **THEN** 系统自动读取该 Character 的 `reference_images`
- **AND** 将参考图 URL 注入到图像生成请求的 `image_urls` 参数中
- **AND** 在 Prompt 中附加角色外观描述（来自 `Character.appearance`）

#### Scenario: 无参考图时退化
- **WHEN** Shot 关联的角色没有 `reference_images`
- **THEN** 仅使用文本 Prompt 生成图像，不注入参考图

### Requirement: 角色参考图管理

系统 SHALL 提供完善的角色参考图管理功能，替代当前的占位实现。

#### Scenario: 上传多类型参考图
- **WHEN** 用户在角色详情页上传参考图
- **THEN** 可指定参考图类型：定妆照（base）、服装（outfit）、表情（expression）、角度（angle）
- **AND** 存储到 `Character.reference_images` 数组

#### Scenario: 设置主参考图
- **WHEN** 角色有多张参考图
- **THEN** 用户可指定一张主参考图（定妆照），分镜生成时优先使用

#### Scenario: 参考图预览
- **WHEN** 用户浏览角色参考图
- **THEN** 按类型分组展示，支持全屏预览和删除

### Requirement: Prompt 角色描述增强

系统 SHALL 在分镜 Prompt 中自动注入角色外观描述，保持角色视觉一致性。

#### Scenario: 自动构建角色 Prompt
- **WHEN** director.agent 构建分镜 Prompt
- **AND** 场景中包含角色
- **THEN** 从 `Character.appearance` 读取外观描述
- **AND** 在 Prompt 中以标准格式注入（如 "角色XX：身高170cm，长发，穿白色连衣裙"）

#### Scenario: 多角色场景
- **WHEN** 场景中包含多个角色
- **THEN** 逐个注入每个角色的外观描述
- **AND** 按角色在场景中的重要性排序

### Requirement: 参考图权重控制

系统 SHALL 支持控制参考图在图像生成中的影响权重。

#### Scenario: 调整参考图强度
- **WHEN** 用户在生成设置中调整 `character_ref_strength` 滑块（0.0 ~ 1.0）
- **THEN** 该参数传递到图像生成 Provider
- **AND** 影响生成图像与参考图的相似程度
