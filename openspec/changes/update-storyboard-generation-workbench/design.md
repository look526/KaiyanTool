# Design: 分镜生成工作台

## Context

视频接口普遍接受单张或多张参考图；当前 `AICreateVideoRequest` 仅 `imageUrl`。ToAPIs Sora2 支持 `image_urls` 数组。

## Decisions

### 九宫格模式下的视频生成（方案 A）

1. 优先使用 `nine_grid_image_url`（一键合成）作为 `image_urls[0]`。
2. 若无合成图但九格均已出图：使用 `position=0` 与 `position=8` 的 `image_url` 作为 `image_urls`（若提供商仅支持单图则只传首张）。
3. 若以上均不满足：返回 400，提示先生成合成图或完成九格出图。

### video_prompt_flags

存于 `Shot.video_prompt_flags`（Json），默认：

```json
{
  "include_action": true,
  "include_dialogue": false,
  "include_camera": true,
  "include_style": true
}
```

请求体可覆盖；未传 `include_*` 时若 `sync_audio_video === true` 则视为 `include_dialogue: true`（兼容旧客户端）。

### GenerationPrompt 版本

`version: 1` 固定；未来新增字段用 `extra` 承载，避免破坏反序列化。

## Risks

- 九格逐张出图产生 9 倍计费：UI 需明确提示。
- 不同 provider 对多参考图支持不一致：ToAPIs 已用数组；其他 provider 可降级为单图。
