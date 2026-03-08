## ADDED Requirements

### Requirement: UI页面重构规范
所有UI重构 SHALL 遵循以下规范:

#### Scenario: 使用CSS变量体系
- **WHEN** 重构页面样式时
- **THEN** 必须使用CSS变量(如 var(--bg-surface), var(--text-primary))

### Requirement: UI重构必须使用Skill
UI重构时 SHALL 使用 ui-refactor skill 进行标准化重构

#### Scenario: 使用ui-refactor skill
- **WHEN** 用户请求重构页面或修改UI
- **THEN** 必须调用 ui-refactor skill 进行标准化重构

### Requirement: 主题兼容性
页面样式 SHALL 同时支持亮色和暗色主题

#### Scenario: 主题兼容性验证
- **WHEN** 实现页面样式时
- **THEN** 必须同时支持亮色和暗色主题

### Requirement: 交互状态实现
可交互元素 SHALL 实现悬停和点击状态反馈

#### Scenario: 交互状态验证
- **WHEN** 实现可交互元素时
- **THEN** 必须实现悬停(isHovered)和点击状态反馈

### Requirement: 设计令牌使用
所有颜色、圆角、阴影 SHALL 使用 design-system/tokens 中定义的值

#### Scenario: 禁止硬编码颜色
- **WHEN** 编写样式代码时
- **THEN** 禁止使用 #ffffff, rgba(0,0,0,0.5) 等硬编码值

### Requirement: 设计系统组件
设计系统组件 SHALL 优先使用于页面重构

#### Scenario: Button组件使用
- **WHEN** 需要使用按钮时
- **THEN** 优先使用 design-system/components/Button
