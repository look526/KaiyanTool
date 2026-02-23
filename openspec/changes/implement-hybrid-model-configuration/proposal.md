# Change: Implement Hybrid AI Model Configuration Architecture

## Why

当前AI配置页面仅支持基础的提供商和模型管理，缺乏用户友好的模型选择体验和全局配置能力。用户在各个功能页面使用AI模型时需要重复配置，无法方便地设置默认模型、管理参数和查看使用历史。实施混合式架构将提供集中式配置管理功能，同时保持各功能页面灵活的模型选择能力，显著提升用户体验和开发效率。

## What Changes

- **添加用户偏好系统**：支持为每种内容类型（文本、图像、视频、音频、剧本、小说、故事线、大纲）设置默认AI模型
- **实现模型参数管理**：允许用户为每种内容类型配置高级参数（temperature、maxTokens等）
- **开发可复用ModelSelector组件**：在功能页面中提供上下文相关的模型选择功能
- **增强AI配置页面**：添加分类标签页、批量测试、参数配置等功能
- **添加模型使用追踪**：记录用户的模型选择历史，支持"上次使用"和推荐功能
- **实现配置导入/导出**：允许用户备份和恢复模型配置

## Impact

- **Affected specs**:
  - `model-preference` (新增)
  - `model-selection` (新增)
  - `ai-provider-management` (修改)

- **Affected code**:
  - `apps/api/src/prisma/schema.prisma` - 新增UserPreferences、ModelParameters表
  - `apps/api/src/controllers/model-preference.controller.ts` - 新增控制器
  - `apps/api/src/routes/model-preference.routes.ts` - 新增路由
  - `apps/web/src/components/ModelSelector.tsx` - 新增通用组件
  - `apps/web/src/pages/ModelConfigurationPage.tsx` - 新增配置页面
  - `apps/web/src/pages/AIProvidersPage.tsx` - 增强现有页面
  - `apps/web/src/lib/api-client.ts` - 新增API客户端方法

- **Breaking changes**:
  - 无，向后兼容现有AI提供商配置

- **Data migration**:
  - 需要迁移现有用户偏好设置到新表结构
