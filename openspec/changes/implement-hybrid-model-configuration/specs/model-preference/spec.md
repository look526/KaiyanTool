# Spec Delta: Model Preference Management

## ADDED Requirements

### Requirement: Set Default AI Models

The system MUST allow users to set default AI models for each of 8 content types (text, image, video, audio, script, novel, storyline, outline) in AI configuration center. The configured default models MUST be automatically applied in corresponding feature pages, reducing repetitive selection.

#### Scenario: 设置默认模型

**Given** 用户已登录并添加了多个AI提供商和模型  
**When** 用户访问 `/settings/ai/models` 配置页面  
**And** 用户点击"文本生成"标签页  
**And** 用户在模型列表中选择"GPT-4-turbo"模型  
**And** 用户点击"设为默认"按钮  
**Then** 该模型应标记为默认状态，显示"默认"徽章  
**And** 系统应将用户偏好保存到数据库  
**And** 用户导航到文本生成功能页面时，该模型应自动被选中

#### Scenario: 修改默认模型

**Given** 用户已设置文本生成的默认模型为"GPT-4-turbo"  
**When** 用户访问配置页面并选择"Claude-3.5-Sonnet"  
**And** 用户点击"设为默认"按钮  
**Then** 默认模型应更新为"Claude-3.5-Sonnet"  
**And** 之前的默认模型标记应被移除  
**And** 更新应立即反映在UI上  
**And** 数据库中的用户偏好应被更新

#### Acceptance Criteria

- [ ] 用户可以为每种内容类型设置一个默认模型
- [ ] 默认模型在UI中有明显的视觉标识（徽章、颜色等）
- [ ] 设置默认模型的操作有即时反馈
- [ ] 默认模型设置持久化到数据库
- [ ] 默认模型在功能页面自动应用

---

### Requirement: Record Model Usage History

The system MUST automatically record the AI models used by users in each feature page. The system MUST support "last used" identification and MUST help users quickly return to previous selections. Usage history MUST be recorded separately by content type.

#### Scenario: 显示上次使用的模型

**Given** 用户上次使用"GPT-4-turbo"生成了剧本  
**When** 用户访问剧本创作页面  
**Then** ModelSelector应显示"GPT-4-turbo"为当前选择  
**And** 应显示"上次使用"徽章  
**And** 模型下拉列表中应显示使用时间

#### Scenario: 记录新的使用

**Given** 用户在剧本创作页面选择"Claude-3.5"模型  
**When** 用户点击生成按钮  
**Then** 系统应记录该使用事件  
**And** 剧本内容类型的上次使用模型应更新  
**And** 更新应在API调用完成后立即保存

#### Scenario: 使用历史按内容类型独立

**Given** 用户使用"GPT-4-turbo"生成文本  
**And** 用户使用"DALL-E 3"生成图像  
**When** 用户访问配置页面查看使用历史  
**Then** 文本生成应显示"GPT-4-turbo"为上次使用  
**And** 图像生成应显示"DALL-E 3"为上次使用  
**And** 两者互不影响

#### Acceptance Criteria

- [ ] 系统自动记录每次模型使用
- [ ] 使用历史按内容类型独立管理
- [ ] ModelSelector显示上次使用的模型
- [ ] 上次使用有明显的视觉标识
- [ ] 使用历史持久化到数据库
- [ ] 使用记录不影响默认模型设置

---

### Requirement: Configure Advanced Parameters

The system MUST allow users to configure advanced parameters for AI models of each content type (such as temperature, maxTokens, topP, steps, etc.) in the configuration center. Parameter configuration MUST be related to specific model types, and different content types MUST have different parameter options.

#### Scenario: 配置文本生成参数

**Given** 用户访问配置页面的"文本生成"标签页  
**When** 用户展开"高级参数"面板  
**And** 用户设置Temperature为0.8  
**And** 用户设置Max Tokens为8192  
**And** 用户点击"保存参数"按钮  
**Then** 参数应保存到数据库  
**And** 用户应看到"参数已保存"的成功提示  
**And** 文本生成功能应使用这些参数

#### Scenario: 参数预设和模板

**Given** 用户经常使用特定参数组合  
**When** 用户保存参数配置为模板  
**And** 用户命名模板为"高质量生成"  
**Then** 模板应保存在用户配置中  
**And** 用户可以快速应用该模板

#### Scenario: 参数验证和推荐

**Given** 用户配置温度参数  
**When** 用户输入超出范围的值（如3.0）  
**Then** 系统应显示错误提示"温度值应在0-2之间"  
**And** 系统应显示推荐值（如0.7）  
**And** 保存按钮应被禁用直到参数有效

#### Acceptance Criteria

- [ ] 每种内容类型有对应的参数配置界面
- [ ] 参数有输入验证和范围限制
- [ ] 系统提供参数推荐值和说明
- [ ] 参数可以保存为模板
- [ ] 参数配置立即应用到功能页面
- [ ] 参数持久化到数据库

---

### Requirement: Batch Test Multiple AI Models

The system MUST allow users to select multiple models for testing simultaneously. The system MUST call test endpoints for each model concurrently and MUST display test results (success/failure, response time). The system MUST support quick validation of multiple models' availability.

#### Scenario: 批量测试模型

**Given** 用户在配置页面选择了3个模型  
**When** 用户点击"批量测试"按钮  
**Then** 系统应并发调用3个模型的测试端点  
**And** 显示测试进度（1/3, 2/3, 3/3）  
**And** 每个模型显示测试状态（进行中/成功/失败）  
**And** 成功的模型显示响应时间  
**And** 失败的模型显示错误原因

#### Scenario: 测试结果展示

**Given** 批量测试完成  
**When** 模型测试成功  
**Then** 应显示绿色勾选图标  
**And** 显示"测试通过"文字  
**And** 显示响应时间（如"1.2s"）  
**When** 模型测试失败  
**Then** 应显示红色叉号图标  
**And** 显示失败原因（如"API密钥无效"）  
**And** 提供"重试"按钮

#### Scenario: 取消批量测试

**Given** 用户启动了批量测试5个模型  
**When** 测试进行到第3个时用户点击"取消"  
**Then** 正在进行的测试应被取消  
**And** 已完成的测试结果应保留  
**And** 未开始的测试不应执行

#### Acceptance Criteria

- [ ] 支持选择多个模型进行批量测试
- [ ] 测试并发执行以提高效率
- [ ] 显示测试进度和状态
- [ ] 成功和失败有清晰的视觉区分
- [ ] 显示响应时间和错误信息
- [ ] 支持取消正在进行的测试
- [ ] 提供重试失败模型的功能

---

### Requirement: Import and Export Configuration

The system MUST allow users to export current AI model configuration (default models, parameters, provider settings) as JSON file. The system MUST also allow users to import configuration from JSON file. The system MUST support configuration backup, migration, and sharing.

#### Scenario: 导出配置

**Given** 用户已配置了多个默认模型和参数  
**When** 用户点击"导出配置"按钮  
**Then** 系统应生成JSON配置文件  
**And** 文件应包含所有用户偏好设置  
**And** 文件应自动下载到用户设备  
**And** 文件名应包含时间戳（如"ai-config-2024-02-23.json"）

#### Scenario: 导入配置

**Given** 用户有一个导出的配置JSON文件  
**When** 用户点击"导入配置"按钮  
**And** 用户选择该JSON文件  
**Then** 系统应验证文件格式  
**And** 显示导入预览对话框  
**And** 列出将要导入的配置项  
**And** 用户确认后应用配置  
**And** 系统应显示"配置导入成功"提示

#### Scenario: 导入验证和冲突处理

**Given** 用户导入的配置与现有设置冲突  
**When** 导入的配置中已有默认模型设置  
**And** 用户当前也设置了不同的默认模型  
**Then** 系统应提示用户如何处理冲突  
**And** 提供选项："覆盖"、"保留现有"、"合并"  
**And** 用户选择后执行相应操作

#### Acceptance Criteria

- [ ] 配置可以导出为JSON文件
- [ ] 导出文件包含完整配置信息
- [ ] 支持从JSON文件导入配置
- [ ] 导入前验证文件格式
- [ ] 提供导入预览和确认
- [ ] 处理配置冲突和合并
- [ ] 导入导出操作有撤销功能

---

### Requirement: Provide Configuration Usage Statistics and Analysis

The system MUST track and display user AI model usage statistics, including usage frequency, success rate, cost analysis, etc. The system MUST help users understand their usage patterns and optimize configuration choices.

#### Scenario: 查看使用统计

**Given** 用户访问配置页面  
**When** 用户点击"使用统计"标签页  
**Then** 应显示各内容类型的使用次数统计  
**And** 显示最常用的模型排名  
**And** 显示模型成功率百分比  
**And** 显示总使用成本估算

#### Scenario: 时间范围筛选

**Given** 用户查看使用统计页面  
**When** 用户选择"最近7天"时间范围  
**Then** 统计数据应只显示最近7天的记录  
**And** 用户可以切换到"最近30天"或"全部"

#### Scenario: 成本分析

**Given** 用户使用多个付费模型  
**When** 用户查看成本分析图表  
**Then** 应显示各模型的成本分布  
**And** 显示总成本趋势  
**And** 提供成本优化建议（如"切换到更便宜的模型可节省30%"）

#### Acceptance Criteria

- [ ] 显示模型使用频率统计
- [ ] 显示模型成功率和错误率
- [ ] 提供成本分析和趋势
- [ ] 支持时间范围筛选
- [ ] 提供优化建议
- [ ] 统计数据可视化展示

---

## Dependencies

- 依赖 `ai-provider-management` spec的AI提供商和模型基础功能
- 依赖 `model-selection` spec的ModelSelector组件集成
- 与 `user-authentication` spec的权限系统集成

## Related Capabilities

- `model-selection` - ModelSelector组件需要读取用户偏好
- `ai-provider-management` - 提供商管理与模型配置关联
- `usage-analytics` - 使用统计功能依赖数据追踪
