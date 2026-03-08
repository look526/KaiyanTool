## ADDED Requirements

### Requirement: 自动请求体命名转换
后端 MUST 自动将客户端发送的请求体中的 camelCase 字段名转换为 snake_case。

#### Scenario: POST 请求体转换
- **WHEN** 客户端发送 POST 请求，body 为 `{ "apiKey": "xxx", "baseUrl": "yyy" }`
- **THEN** 后端中间件自动转换为 `{ "api_key": "xxx", "base_url": "yyy" }`

#### Scenario: 嵌套对象转换
- **WHEN** 客户端发送包含嵌套对象的请求 `{ "user": { "userId": "123" } }`
- **THEN** 后端自动转换为 `{ "user": { "user_id": "123" } }`

#### Scenario: 数组元素转换
- **WHEN** 客户端发送包含数组的请求 `{ "items": [{ "itemId": "1" }, { "itemId": "2" }] }`
- **THEN** 后端自动转换为 `{ "items": [{ "item_id": "1" }, { "item_id": "2" }] }`

#### Scenario: 跳过文件上传请求
- **WHEN** 客户端发送 multipart/form-data 类型的请求
- **THEN** 中间件跳过转换，保持原始数据

---

### Requirement: 自动响应数据命名转换
后端 MUST 自动将响应数据中的 snake_case 字段名转换为 camelCase。

#### Scenario: 简单对象响应转换
- **WHEN** 后端返回 `{ "api_key": "xxx", "base_url": "yyy" }`
- **THEN** 客户端接收 `{ "apiKey": "xxx", "baseUrl": "yyy" }`

#### Scenario: 嵌套对象响应转换
- **WHEN** 后端返回 `{ "user": { "user_id": "123" } }`
- **THEN** 客户端接收 `{ "user": { "userId": "123" } }`

#### Scenario: 错误响应不转换
- **WHEN** 后端返回错误响应 `{ "success": false, "error": { "code": "INVALID_REQUEST" } }`
- **THEN** 错误响应保持原始格式，不进行转换

---

### Requirement: 中间件可配置性
中间件 MUST 支持配置选项，允许跳过特定路由或字段。

#### Scenario: 跳过特定路由
- **WHEN** 配置中指定 `/health` 路由跳过转换
- **THEN** `/health` 路由的请求和响应不进行命名转换

#### Scenario: 环境变量控制
- **WHEN** 环境变量 `CASE_TRANSFORM_ENABLED=false`
- **THEN** 转换中间件不执行任何转换

---

### Requirement: 转换性能要求
转换操作 MUST 在规定时间内完成，不应显著影响 API 响应时间。

#### Scenario: 小对象转换性能
- **WHEN** 请求/响应对象大小 < 1KB
- **THEN** 转换时间应 < 5ms

#### Scenario: 大对象转换性能
- **WHEN** 请求/响应对象大小 < 100KB
- **THEN** 转换时间应 < 50ms
