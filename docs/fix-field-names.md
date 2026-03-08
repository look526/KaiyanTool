# 字段名修复方案

## 问题

Prisma schema 使用 snake_case 字段名（如 `user_id`, `created_at`），但代码中使用 camelCase（如 `userId`, `createdAt`），导致大量类型不匹配错误。

## 最简单修复方案

在 Prisma schema 中使用 `@map` 属性，将数据库的 snake_case 字段映射为 camelCase。

### 示例

**之前：**
```prisma
model Session {
  id         String   @id @db.Uuid
  user_id    String   @db.Uuid
  token      String   @unique
  expires_at DateTime
  created_at DateTime @default(now())
  User       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

**修复后：**
```prisma
model Session {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  token      String   @unique
  expiresAt  DateTime @map("expires_at")
  createdAt   DateTime @default(now()) @map("created_at")
  User       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 需要修复的模型

### Session
- `user_id` → `userId`
- `expires_at` → `expiresAt`
- `created_at` → `createdAt`
- 添加 `@default(uuid())` 到 `id`

### User
- `password_hash` → `passwordHash`
- `avatar_url` → `avatarUrl`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`
- `last_login_at` → `lastLoginAt`
- `storage_used` → `storageUsed`
- `storage_limit` → `storageLimit`

### Project
- `owner_id` → `ownerId`
- `thumbnail_url` → `thumbnailUrl`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

### ProjectMember
- `project_id` → `projectId`
- `user_id` → `userId`
- `joined_at` → `joinedAt`

### Character
- `project_id` → `projectId`
- `avatar_url` → `avatarUrl`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

### Scene
- `project_id` → `projectId`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

### Script
- `project_id` → `projectId`
- `thumbnail_url` → `thumbnailUrl`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

### Shot
- `project_id` → `projectId`
- `scene_id` → `sceneId`
- `character_id` → `characterId`
- `thumbnail_url` → `thumbnailUrl`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

### Content
- `project_id` → `projectId`
- `user_id` → `userId`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

### Document
- `project_id` → `projectId`
- `user_id` → `userId`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

## 执行步骤

1. 修改 `apps/api/prisma/schema.prisma`，为所有字段添加 `@map` 属性
2. 运行 `npx prisma generate` 重新生成 Prisma Client
3. 修改 `apps/api/src/types/express.d.ts`，将 session 类型改回 camelCase
4. 运行 `npx prisma db push` 更新数据库（可选，生产环境需要迁移脚本）
5. 测试所有功能

## 注意事项

- 关系名保持原样（如 `User`, `Project`）
- 外键字段名也要映射（如 `userId` 对应数据库的 `user_id`）
- `@map` 只影响字段名，不影响表名
