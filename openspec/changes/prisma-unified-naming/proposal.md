# Change: 统一 Prisma 命名规范，使用 @map 注解

## Why
当前 Prisma schema 存在混合命名混乱：
- 部分模型使用 `@map("project_id")` 注解 → 代码中应使用驼峰 `projectId`
- 部分模型直接使用 `project_id` → 代码中应使用蛇形 `project_id`

这导致代码中字段名不统一，TypeScript 报错层出不穷。

## What Changes
**核心方案**：统一修改 Prisma schema，让所有模型都使用 `@map` 注解，这样代码中可以统一使用驼峰命名。

### 修改策略

1. **为没有 @map 的字段添加 @map 注解**
   - 例如：`project_id String @db.Uuid` → `projectId String @map("project_id") @db.Uuid`

2. **运行 prisma generate**
   - 生成新的 Prisma Client

3. **代码中使用驼峰命名**
   - 所有 Prisma 查询使用驼峰：`where: { projectId }`
   - 访问返回字段使用驼峰：`result.projectId`

### 需要修改的字段（按模型）

| 模型 | 字段 | 当前 | 改为 |
|------|------|------|------|
| Asset | project_id | project_id | projectId @map("project_id") |
| Novel | project_id | project_id | projectId @map("project_id") |
| Outline | project_id | project_id | projectId @map("project_id") |
| Scene | project_id | project_id | projectId @map("project_id") |
| Shot | project_id | project_id | projectId @map("project_id") |
| User | 多个 | snake_case | camelCase @map |
| AIProvider | 多个 | snake_case | camelCase @map |
| ... | ... | ... | ... |

### 验证
- `npx prisma generate` 成功
- `npx tsc --noEmit` 无错误

## Impact
- 需要修改 Prisma schema（所有模型）
- 需要运行 prisma generate
- 理论上不需要修改代码（因为使用 @map 后驼峰自动映射）

## Block
1. 修改 Prisma schema，添加 @map 注解
2. 运行 prisma generate
3. 验证代码编译
