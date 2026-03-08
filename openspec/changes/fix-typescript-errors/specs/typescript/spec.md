## ADDED Requirements

### Requirement: TypeScript 编译无错误
项目 MUST 能够通过 TypeScript 编译，不产生任何类型错误。

#### Scenario: 运行 tsc 编译
- **WHEN** 执行 `npx tsc --noEmit`
- **THEN** 不输出任何错误

#### Scenario: 开发环境编译
- **WHEN** 在 VS Code 中打开项目
- **THEN** 不显示 TypeScript 错误提示

---

### Requirement: Prisma 字段命名一致性
代码中使用 Prisma 查询时 MUST 使用 snake_case 字段名。

#### Scenario: WorkflowExecution 查询
- **WHEN** 查询 WorkflowExecution 表
- **THEN** 使用 `workflow_id`, `current_step_id`, `created_at` 等 snake_case 字段名

#### Scenario: 创建更新数据
- **WHEN** 使用 prisma.create() 或 prisma.update()
- **THEN** 数据对象中的字段名必须与 Prisma schema 一致

---

### Requirement: Zod 验证器语法正确
validator/index.ts 中的 Zod 定义 MUST 使用正确的 API 语法。

#### Scenario: 定义枚举类型
- **WHEN** 使用 z.enum() 定义枚举
- **THEN** 使用正确的参数格式，不包含废弃的 errorMap 选项
