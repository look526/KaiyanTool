# GenerationPrompt v1（结构化提示词）

用于图片/视频生成：服务端组装为纯文本后发给模型；也可整段 JSON 存入分镜 `generation_prompt_json` 供审计与复用。

## 字段

| 字段 | 含义 |
|------|------|
| `version` | 固定为 `1` |
| `lens.description` | 镜头/画面描述（常与 action 同源） |
| `lens.camera_movement` | 镜头运动 |
| `character` | 角色 id、名称、备注 |
| `action` | 动作/表演要点 |
| `scene` | 场景 id、地点、时间、备注 |
| `dialogue` | 对白或口播 |
| `style` | 视觉风格 |
| `extra` | 扩展键值，不参与默认拼装时可留空 |

序列化规则见 `@ai-content-platform/shared` 中 `generationPromptToPlainText`。
