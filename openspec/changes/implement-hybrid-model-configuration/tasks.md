# Tasks: Implement Hybrid AI Model Configuration Architecture

## 1. Phase 1: Database & API Foundation (P0 - Week 1)

- [x] 1.1 设计并实现UserPreferences数据模型
  - 添加id、userId、defaultModels、lastUsedModels、modelParameters字段
  - 建立与User表的一对一关系
  - 添加适当的数据库索引优化查询性能
  - **Validation**: 通过Prisma schema验证，测试数据迁移

- [x] 1.2 设计并实现ModelParameters数据模型
  - 添加id、userId、contentType、parameters字段
  - 建立与User表的一对多关系
  - 添加唯一约束确保每个用户每种内容类型只有一个参数配置
  - **Validation**: 测试参数CRUD操作和约束条件

- [x] 1.3 创建数据库迁移脚本
  - 编写up()和down()迁移函数
  - 处理现有AIProviderModel数据迁移到新表结构
  - 添加回滚逻辑确保数据安全
  - **Validation**: 在测试环境运行迁移，验证数据完整性

- [x] 1.4 实现ModelPreferenceController
  - 实现getUserPreferences()方法获取用户偏好
  - 实现setDefaultModel()方法设置默认模型
  - 实现saveModelParameters()方法保存参数配置
  - 实现testModels()方法批量测试模型
  - 实现recordModelUsage()方法记录使用历史
  - 添加完整的错误处理和输入验证
  - **Validation**: 单元测试覆盖所有API端点

- [x] 1.5 创建模型偏好相关API路由
  - 配置GET /api/preferences路由
  - 配置POST /api/preferences/default路由
  - 配置POST /api/preferences/parameters路由
  - 配置POST /api/models/test路由
  - 配置POST /api/models/usage路由
  - 添加认证中间件保护所有路由
  - **Validation**: 使用Postman或curl测试所有端点

- [x] 1.6 扩展API客户端方法
  - 在api-client.ts中添加getUserPreferences()
  - 添加setDefaultModel(contentType, modelId)
  - 添加saveModelParameters(contentType, params)
  - 添加testModels(modelIds)方法
  - 添加recordModelUsage(contentType, modelId)
  - 添加getLastUsedModels()方法
  - 添加getModelsByType(contentType)方法
  - **Validation**: 在TypeScript中验证类型安全

## 2. Phase 2: Core Component Development (P0 - Week 2)

- [x] 2.1 实现ModelSelector核心组件
  - 创建TypeScript接口定义props
  - 实现模型列表加载和过滤逻辑
  - 实现按提供商分组的显示逻辑
  - 添加选中状态管理和onChange回调
  - 实现展开/收起的下拉面板
  - **Validation**: 组件单元测试，测试各种props组合

- [x] 2.2 添加模型使用历史功能
  - 实现loadLastUsedModels()从API获取历史
  - 在选择器中显示"上次使用"标签
  - 实现使用记录逻辑自动更新历史
  - 添加本地localStorage缓存机制
  - **Validation**: 测试历史记录的保存和加载

- [x] 2.3 实现默认模型标识功能
  - 从API获取全局默认模型配置
  - 在模型列表中高亮显示默认模型
  - 添加"设为默认"快速操作按钮
  - 实现默认模型变更的实时更新
  - **Validation**: 测试默认模型的设置和切换

- [x] 2.4 添加模型搜索和过滤功能
  - 实现按提供商名称搜索
  - 实现按内容类型过滤
  - 实现按能力标签筛选
  - 添加清空过滤器的快捷操作
  - **Validation**: 测试各种搜索和过滤场景

- [x] 2.5 实现ModelSelector的UI样式
  - 使用项目设计系统变量
  - 实现悬停和激活状态的视觉反馈
  - 添加加载骨架屏状态
  - 实现响应式布局适配移动端
  - 添加键盘导航支持（Tab、Enter、Escape）
  - **Validation**: 视觉回归测试，确保设计一致性

- [x] 2.6 添加模型测试功能
  - 在选择器中集成测试按钮
  - 实现测试进度显示
  - 显示测试结果（成功/失败/进行中）
  - 添加测试失败时的错误提示
  - **Validation**: 端到端测试模型测试流程

- [x] 2.7 创建ModelCard子组件
  - 封装单个模型的显示逻辑
  - 显示模型名称、描述、提供商信息
  - 渲染能力标签
  - 添加快速操作按钮（设为默认、测试、编辑）
  - **Validation**: 组件单元测试

## 3. Phase 3: Configuration Center UI (P1 - Week 3-4)

- [x] 3.1 创建ModelConfigurationPage页面框架
  - 设置页面路由和基本布局
  - 实现响应式容器结构
  - 添加页面标题和描述
  - 集成Sidebar导航
  - **Validation**: 测试页面加载和路由

- [x] 3.2 实现分类标签页组件
  - 创建CategoryTabs组件
  - 支持8种内容类型切换
  - 实现标签切换动画效果
  - 显示每个类型的模型数量
  - 添加键盘导航支持
  - **Validation**: 测试所有标签切换和动画

- [x] 3.3 开发模型配置区域
  - 创建ModelConfigSection组件
  - 实现默认模型下拉选择器
  - 渲染按类型分组的模型列表
  - 集成ModelCard组件显示模型详情
  - **Validation**: 测试配置区域的所有交互

- [x] 3.4 实现高级参数配置面板
  - 创建ParametersPanel组件
  - 为每种内容类型显示相关参数
  - 实现参数表单（temperature、maxTokens等）
  - 添加参数保存和重置功能
  - 显示参数说明和推荐值
  - **Validation**: 测试参数的保存和加载

- [x] 3.5 添加批量操作功能
  - 实现批量启用/禁用模型
  - 实现批量测试多个模型
  - 添加全选/反选功能
  - 显示批量操作进度
  - **Validation**: 测试各种批量操作场景

- [x] 3.6 实现配置导入/导出功能
  - 添加导出配置按钮
  - 实现JSON格式配置导出
  - 添加导入配置功能
  - 实现配置文件解析和验证
  - 添加导入预览和确认对话框
  - **Validation**: 测试导入导出的数据完整性

- [x] 3.7 集成提供商管理到配置中心
  - 在配置页面顶部集成现有AIProvidersPage功能
  - 保持提供商管理的一致性
  - 添加提供商与模型关联的显示
  - 实现从配置页面跳转到提供商管理
  - **Validation**: 端到端测试提供商和模型配置的集成

- [x] 3.8 添加使用统计和分析面板
  - 创建UsageStatsPanel组件
  - 显示模型使用频率统计
  - 展示模型性能指标（响应时间、成功率）
  - 添加成本分析图表
  - 实现时间范围筛选
  - **Validation**: 测试统计数据准确性

## 4. Phase 4: Feature Integration (P1 - Week 5-6)

- [x] 4.1 集成ModelSelector到剧本创作页面
  - 在ScriptEditorPage中添加ModelSelector
  - 连接模型选择到剧本生成功能
  - 实现模型切换时保留草稿
  - 添加模型相关的提示信息
  - **Validation**: 端到端测试剧本创建的完整流程

- [x] 4.2 集成ModelSelector到图像生成页面
  - 在图像生成相关页面添加选择器
  - 确保只显示图像类型模型
  - 实现图像参数与模型选择的联动
  - 添加图像生成结果中的模型信息显示
  - **Validation**: 测试图像生成与模型选择的集成

- [x] 4.3 集成ModelSelector到视频生成页面
  - 在视频生成页面添加模型选择器
  - 筛选视频生成类型的模型
  - 实现视频参数（时长、分辨率）与模型的关联
  - 添加视频生成中的模型标识
  - **Validation**: 测试视频生成完整流程

- [x] 4.4 集成ModelSelector到文本生成页面
  - 在文本生成功能中嵌入选择器
  - 过滤显示文本处理模型
  - 实现文本参数与模型配置的联动
  - **Validation**: 测试文本生成功能

- [x] 4.5 集成ModelSelector到其他功能页面
  - 小说创作页面集成
  - 故事线生成页面集成
  - 大纲生成页面集成
  - 确保所有页面使用一致的ModelSelector体验
  - **Validation**: 跨页面一致性测试

- [x] 4.6 实现模型配置持久化
  - 使用localStorage缓存用户模型偏好
  - 实现偏好设置的自动加载
  - 添加配置变更的同步机制
  - 实现离线模式下的模型选择
  - **Validation**: 测试缓存失效和刷新逻辑

- [x] 4.7 添加智能模型推荐功能
  - 基于使用历史推荐模型
  - 根据内容类型智能推荐最优模型
  - 实现推荐理由说明
  - 添加用户接受/拒绝推荐的反馈
  - **Validation**: 测试推荐算法准确性

## 5. Phase 5: Advanced Features & Polish (P2 - Week 7)

- [x] 5.1 实现模型对比功能
  - 创建ModelComparison组件
  - 支持选择2-3个模型进行对比
  - 并行测试多个模型
  - 显示对比结果（质量、速度、成本）
  - **Validation**: 测试对比功能的准确性

- [x] 5.2 添加模型性能监控
  - 实现API响应时间跟踪
  - 记录模型成功率统计
  - 创建性能告警机制
  - 添加性能报告导出
  - **Validation**: 测试监控数据收集和展示

- [x] 5.3 优化模型加载性能
  - 实现模型列表的懒加载
  - 添加分页加载机制
  - 优化大数据量下的渲染性能
  - 实现虚拟滚动减少DOM节点
  - **Validation**: 性能测试，确保100+模型流畅加载

- [x] 5.4 完善错误处理和用户反馈
  - 添加友好的错误提示信息
  - 实现错误重试机制
  - 添加操作撤销功能
  - 创建错误报告收集
  - **Validation**: 测试各种错误场景

- [x] 5.5 实现配置模板功能
  - 允许用户保存配置为模板
  - 提供预设配置模板（如"快速"、"经济"、"高质量"）
  - 实现模板的应用和切换
  - 添加模板分享功能
  - **Validation**: 测试模板的保存和应用

- [x] 5.6 添加无障碍支持
  - 实现完整的键盘导航
  - 添加屏幕阅读器支持
  - 确保颜色对比度符合WCAG标准
  - 添加焦点指示器
  - **Validation**: 使用屏幕阅读器测试

## 6. Testing & Validation (All Phases)

- [x] 6.1 编写API单元测试
  - 测试所有ModelPreferenceController方法
  - 测试数据库模型操作
  - 测试认证和权限验证
  - 测试错误处理逻辑
  - 覆盖率目标：>80%

- [x] 6.2 编写前端组件测试
  - ModelSelector组件单元测试
  - ModelConfigurationPage集成测试
  - ModelCard组件测试
  - 测试用户交互和状态管理
  - 覆盖率目标：>75%

- [x] 6.3 进行端到端测试
  - 测试完整的模型配置流程
  - 测试配置在各功能页面的应用
  - 测试配置导入/导出功能
  - 测试跨浏览器的兼容性
  - 测试移动端响应式布局

- [x] 6.4 性能测试
  - 测试大规模模型列表加载性能
  - 测试API响应时间
  - 测试数据库查询性能
  - 识别并优化性能瓶颈

- [x] 6.5 用户体验测试
  - 邀请真实用户测试配置流程
  - 收集用户反馈和建议
  - 观察用户使用模式
  - 识别易混淆或难用的功能点
  - 根据反馈进行迭代优化

## 7. Documentation & Deployment (Final Week)

- [x] 7.1 编写用户文档
  - 创建模型配置使用指南
  - 编写常见问题解答
  - 添加模型选择最佳实践
  - 创建视频教程
  - **Validation**: 技术审查和用户测试

- [x] 7.2 更新API文档
  - 添加新端点的Swagger文档
  - 提供请求/响应示例
  - 添加错误码说明
  - 添加认证和使用说明
  - **Validation**: 文档审查和API测试验证

- [x] 7.3 编写开发者文档
  - ModelSelector组件使用文档
  - API集成指南
  - 数据模型说明
  - 扩展开发指南（添加新模型类型）
  - **Validation**: 开发者审查和反馈

- [x] 7.4 准备部署
  - 创建数据库迁移回滚计划
  - 准备生产环境配置
  - 创建部署检查清单
  - 准备监控和告警配置
  - **Validation**: 预生产环境测试

- [x] 7.5 执行生产部署
  - 运行数据库迁移
  - 部署API更新
  - 部署前端更新
  - 验证部署成功
  - 监控生产环境指标
  - **Validation**: 生产环境验证测试

## Dependencies

- 所有Phase 1任务必须完成后才能开始Phase 2
- Phase 2.1-2.7必须按顺序完成
- Phase 3可以与Phase 4部分并行开发
- 所有Phase 1-4完成后才能开始Phase 5
- Phase 6与各阶段并行进行
- Phase 7在所有开发任务完成后进行

## Success Criteria

每个阶段完成后需要满足：

**Phase 1完成标准**:
- 数据库迁移成功运行，数据完整性验证通过
- 所有API端点返回正确的JSON响应
- 单元测试覆盖率达到80%以上
- API文档更新并验证

**Phase 2完成标准**:
- ModelSelector组件可在任何页面独立使用
- 支持所有8种内容类型的模型选择
- 通过所有组件单元测试
- 无TypeScript类型错误

**Phase 3完成标准**:
- 配置中心页面功能完整可用
- 所有分类标签页正常工作
- 批量操作功能正常
- 配置导入/导出功能验证通过

**Phase 4完成标准**:
- 所有功能页面成功集成ModelSelector
- 模型选择在各个功能中正常工作
- 用户偏好设置正确保存和加载
- 端到端测试覆盖主要使用场景

**Phase 5完成标准**:
- 高级功能稳定运行
- 性能指标满足目标（加载<1s，100+模型）
- 无障碍支持通过WCAG AA标准
- 用户反馈积极

**最终成功标准**:
- 用户可以在配置中心集中管理所有AI模型
- 各功能页面提供灵活的模型选择体验
- 模型使用历史和默认设置正常工作
- 所有测试通过，文档完整
- 生产环境部署成功并稳定运行
