# Spec Delta: Model Selection Component

## ADDED Requirements

### Requirement: ModelSelector Provides Context-Aware Model Selection

ModelSelector MUST be a reusable React component that can be embedded in any feature page. The component MUST automatically filter and display matching AI models based on specified contentType. The component MUST support quick selection, testing, and management.

#### Scenario: 在剧本创作页面使用ModelSelector

**Given** 用户在剧本创作页面  
**When** 页面渲染ModelSelector组件，contentType="script"  
**Then** 只应显示剧本类型的AI模型  
**And** 应显示用户上次使用的剧本模型（如果有）  
**And** 应显示全局默认的剧本模型（如果没有上次使用）  
**And** 用户可以打开下拉列表选择其他模型

#### Scenario: 模型按提供商分组显示

**Given** 用户有来自多个提供商的模型（智谱、OpenAI、Anthropic）  
**When** 用户打开ModelSelector下拉列表  
**Then** 模型应按提供商分组显示  
**And** 每个组显示提供商图标和名称  
**And** 显示该提供商的模型数量  
**And** 组间有清晰的视觉分隔

#### Scenario: 显示模型元信息

**Given** 用户打开ModelSelector下拉列表  
**Then** 每个模型应显示：
  - 模型名称
  - 提供商名称和图标
  - 模型描述（如果有）
  - "默认"徽章（如果是全局默认）
  - "上次使用"徽章（如果是上次使用的）
  - 能力标签（如果有）

#### Scenario: 选择模型触发回调

**Given** 用户在ModelSelector中  
**When** 用户点击某个模型选项  
**Then** 应触发onChange回调，传递模型ID  
**And** 下拉列表应关闭  
**And** 选中状态应更新  
**And** 使用记录应被保存（如果showLastUsed=true）

#### Acceptance Criteria

- [ ] ModelSelector可以在任何页面独立使用
- [ ] 根据contentType筛选模型
- [ ] 模型按提供商分组显示
- [ ] 显示完整的模型元信息
- [ ] 支持默认和上次使用标识
- [ ] 选择模型触发正确的回调
- [ ] 组件响应式设计适配移动端

---

### Requirement: ModelSelector Supports Model Search and Filtering

ModelSelector MUST allow users to search model names. The component MUST filter by provider and MUST filter by capability tags to quickly find the target model.

#### Scenario: 搜索模型名称

**Given** 用户有20+个模型  
**When** 用户在搜索框输入"GPT"  
**Then** 列表应只显示名称包含"GPT"的模型  
**And** 搜索结果实时更新（防抖）  
**And** 清空搜索框应恢复显示所有模型

#### Scenario: 按提供商过滤

**Given** 用户有多个提供商的模型  
**When** 用户点击提供商过滤下拉  
**And** 用户选择"OpenAI"  
**Then** 只应显示OpenAI的模型  
**And** 其他提供商的模型应被隐藏  
**And** 用户可以清除过滤器查看所有模型

#### Scenario: 按能力标签筛选

**Given** 用户选择"文本生成"类型  
**When** 用户点击"对话"能力标签  
**Then** 只应显示支持对话能力的文本模型  
**And** 不支持的模型应被隐藏  
**And** 可以选择多个标签进行组合筛选

#### Scenario: 组合过滤和搜索

**Given** 用户输入搜索"turbo"  
**And** 选择了"OpenAI"提供商过滤  
**And** 选择了"对话"能力标签  
**When** 过滤结果更新  
**Then** 应显示同时满足所有条件的模型  
**And** 结果数量应准确反映匹配项

#### Acceptance Criteria

- [ ] 支持实时搜索模型名称
- [ ] 支持按提供商过滤
- [ ] 支持按能力标签筛选
- [ ] 过滤器可以组合使用
- [ ] 清空过滤器恢复完整列表
- [ ] 显示过滤结果数量

---

### Requirement: ModelSelector Provides Model Testing Feature

ModelSelector MUST allow users to quickly test the connectivity and availability of individual models. The component MUST display test result status.

#### Scenario: 测试单个模型

**Given** 用户在ModelSelector中查看模型列表  
**When** 用户点击某个模型的"测试"按钮  
**Then** 应调用模型测试API  
**And** 模型应显示"测试中..."状态  
**And** 测试按钮应禁用防止重复点击  
**When** 测试成功  
**Then** 应显示绿色勾选图标  
**And** 显示"测试通过"文字  
**And** 显示响应时间（如"856ms"）  
**When** 测试失败  
**Then** 应显示红色叉号图标  
**And** 显示失败原因（如"API密钥无效"）  
**And** 提供"重试"按钮

#### Scenario: 测试结果持久化

**Given** 用户测试了多个模型  
**When** 用户关闭并重新打开ModelSelector  
**Then** 之前的测试结果应仍然显示  
**And** 测试结果应缓存一定时间（如5分钟）  
**And** 超时后应重新测试

#### Scenario: 批量测试快捷入口

**Given** 用户在ModelSelector中  
**When** 用户点击"测试所有"按钮  
**Then** 应启动批量测试所有可见模型  
**And** 显示总体进度（如"3/5完成"）  
**And** 逐个显示每个模型的测试结果

#### Acceptance Criteria

- [ ] 支持测试单个模型
- [ ] 显示测试进行中状态
- [ ] 区分成功和失败状态
- [ ] 显示响应时间和错误信息
- [ ] 测试结果有视觉反馈
- [ ] 支持重试失败的模型
- [ ] 提供批量测试入口

---

### Requirement: ModelSelector Supports Keyboard Navigation and Accessibility

ModelSelector MUST fully support keyboard operations (Tab, Enter, Escape, arrow keys). The component MUST comply with WCAG accessibility standards.

#### Scenario: Tab键导航

**Given** 用户使用键盘操作页面  
**When** 用户按Tab键焦点到ModelSelector  
**Then** 触发器应获得焦点  
**And** 焦点样式应清晰可见  
**When** 用户再次按Tab键  
**Then** 焦点应移动到下一个可聚焦元素  
**And** 下拉列表应保持关闭状态

#### Scenario: Enter打开下拉列表

**Given** ModelSelector触发器获得焦点  
**When** 用户按Enter键  
**Then** 下拉列表应打开  
**And** 焦点应移动到第一个模型选项  
**And** 模型列表应可以键盘导航

#### Scenario: 方向键选择模型

**Given** 下拉列表已打开  
**When** 用户按向下方向键  
**Then** 焦点应移动到下一个模型选项  
**And** 滚动列表以保持焦点可见  
**When** 用户按向上方向键  
**Then** 焦点应移动到上一个模型选项

#### Scenario: Enter选择模型

**Given** 用户已用方向键选择模型  
**When** 用户按Enter键  
**Then** 应触发onChange回调  
**And** 下拉列表应关闭  
**And** 焦点应返回到触发器

#### Scenario: Escape关闭下拉列表

**Given** 下拉列表已打开  
**When** 用户按Escape键  
**Then** 下拉列表应关闭  
**And** 焦点应返回到触发器  
**And** 之前的选择应保持不变

#### Scenario: 屏幕阅读器支持

**Given** 用户使用屏幕阅读器  
**When** 焦点到ModelSelector  
**Then** 应朗读"AI模型选择器，当前选择的模型"  
**And** 模型选项应有正确的ARIA角色  
**And** 选择和状态变化应有ARIA live区域通知

#### Acceptance Criteria

- [ ] Tab键可以导航到ModelSelector
- [ ] Enter键可以打开/选择
- [ ] 方向键可以在列表中导航
- [ ] Escape键可以关闭列表
- [ ] 焦点样式清晰可见
- [ ] 符合WCAG 2.1 AA标准
- [ ] 屏幕阅读器可以正确朗读
- [ ] 所有交互有ARIA标签

---

### Requirement: ModelSelector Displays Model Capability Tags

Each AI model MUST be able to be configured with capability tags (such as conversation, creation, translation, code, etc.). ModelSelector MUST display these tags to help users select the appropriate model.

#### Scenario: 显示能力标签

**Given** 模型配置了能力标签["对话", "创作", "翻译"]  
**When** 模型在ModelSelector列表中显示  
**Then** 应显示3个能力标签  
**And** 每个标签有独立的颜色（基于模型类型）  
**And** 标签应有圆角和悬停效果

#### Scenario: 能力标签作为筛选条件

**Given** 用户在ModelSelector中  
**When** 用户点击"对话"能力标签  
**Then** 只应显示有"对话"能力的模型  
**And** 标签应显示为选中状态  
**And** 其他无该能力的模型应被过滤

#### Scenario: 多个标签组合筛选

**Given** 用户点击"对话"和"创作"两个标签  
**When** 筛选结果更新  
**Then** 应显示同时支持两个能力的模型  
**And** 模型数量应准确反映匹配项  
**And** 可以通过再次点击取消某个标签筛选

#### Scenario: 能力标签悬停提示

**Given** 用户鼠标悬停在能力标签上  
**Then** 应显示提示说明该能力的含义  
**And** 提示应有合理的延迟（如300ms）  
**And** 提示应在鼠标移开后消失

#### Acceptance Criteria

- [ ] 每个模型显示配置的能力标签
- [ ] 能力标签有视觉区分
- [ ] 标签可以作为筛选条件
- [ ] 支持多标签组合筛选
- [ ] 标签有悬停提示说明
- [ ] 标签选中状态清晰可见

---

### Requirement: ModelSelector Supports Configuration Management Navigation

ModelSelector MUST provide quick entry to navigate to complete configuration center. The component MUST allow users to manage providers, view usage statistics, configure advanced parameters, etc.

#### Scenario: 快速管理入口

**Given** 用户在功能页面使用ModelSelector  
**When** 用户点击触发器的设置图标  
**Then** 应显示下拉菜单  
**And** 菜单包含"管理所有模型"选项  
**And** 菜单包含"查看使用统计"选项  
**And** 菜单包含"配置高级参数"选项

#### Scenario: 跳转到配置中心

**Given** 用户点击"管理所有模型"  
**When** 用户点击该选项  
**Then** 应导航到 `/settings/ai/models` 配置页面  
**And** 应保持当前的content type为激活标签  
**And** 用户应可以返回之前的功能页面

#### Scenario: 浏览器历史管理

**Given** 用户从剧本创作页面跳转到配置中心  
**When** 用户点击浏览器的返回按钮  
**Then** 应返回到剧本创作页面  
**And** ModelSelector应保持之前的选择状态  
**And** 页面状态应正确恢复

#### Acceptance Criteria

- [ ] ModelSelector提供设置图标/菜单
- [ ] 菜单包含多个管理选项
- [ ] 点击管理选项正确跳转
- [ ] 跳转保持上下文信息
- [ ] 支持浏览器导航返回

---

## MODIFIED Requirements

### MODIFIED Requirement: AI配置页面应集成ModelSelector组件

现有的AIProvidersPage MUST重构以支持新的混合架构，将提供商管理与模型选择分离，同时保持向后兼容。

#### Scenario: 保留提供商管理功能

**Given** 用户访问 `/settings/ai` 页面  
**When** 页面渲染完成  
**Then** 应显示现有的提供商列表和管理功能  
**And** 应显示"添加提供商"按钮  
**And** 用户可以编辑/删除提供商  
**And** 所有现有功能正常工作

#### Scenario: 添加模型管理入口

**Given** 用户在AI配置页面  
**When** 页面渲染完成  
**Then** 应显示"模型配置"入口按钮  
**And** 按钮链接到新的 `/settings/ai/models` 页面  
**And** 按钮有清晰的说明文字

#### Scenario: 保持向后兼容

**Given** 现有用户已配置了提供商和模型  
**When** 更新部署混合架构  
**Then** 用户的现有配置应完全保留  
**And** 不需要用户重新配置  
**And** 数据迁移应自动执行

#### Acceptance Criteria

- [ ] AIProvidersPage保留现有提供商管理功能
- [ ] 添加模型配置页面入口
- [ ] 现有用户配置完全迁移
- [ ] 向后兼容，不破坏现有功能
- [ ] 提供清晰的导航和说明

---

## Dependencies

- 依赖 `model-preference` spec的用户偏好API
- 依赖 `ai-provider-management` spec的模型数据
- 依赖前端设计系统的样式变量

## Related Capabilities

- `model-preference` - ModelSelector读取和更新用户偏好
- `ai-provider-management` - 提供商数据用于ModelSelector
- `configuration-center` - ModelSelector跳转的目标页面
