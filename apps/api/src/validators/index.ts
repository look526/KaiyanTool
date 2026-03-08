import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(100, '项目名称不能超过100个字符'),
  description: z.string().max(500, '项目描述不能超过500个字符').optional(),
  type: z.enum(['script', 'novel', 'mixed']).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(100, '项目名称不能超过100个字符').optional(),
  description: z.string().max(500, '项目描述不能超过500个字符').optional(),
  type: z.enum(['script', 'novel', 'mixed']).optional(),
});

export const getProjectsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, '页码必须是数字').optional().default('1'),
  limit: z.string().regex(/^\d+$/, '每页数量必须是数字').optional().default('10'),
  search: z.string().optional(),
  type: z.enum(['script', 'novel', 'mixed']).optional(),
});

export const projectIdParamSchema = z.object({
  id: z.string().uuid('无效的项目ID'),
});

export const createDocumentSchema = z.object({
  projectId: z.string().uuid('无效的项目ID'),
  title: z.string().min(1, '文档标题不能为空').max(200, '文档标题不能超过200个字符'),
  content: z.string().optional(),
  type: z.enum(['script', 'novel', 'outline']).optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1, '文档标题不能为空').max(200, '文档标题不能超过200个字符').optional(),
  content: z.string().optional(),
  type: z.enum(['script', 'novel', 'outline']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
});

export const registerSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符').max(100, '密码不能超过100个字符'),
  name: z.string().min(1, '姓名不能为空').max(50, '姓名不能超过50个字符'),
});

export const createAIProviderSchema = z.object({
  name: z.string().min(1, 'Provider名称不能为空').max(50, 'Provider名称不能超过50个字符'),
  type: z.enum(['openai', 'zhipu', 'google', 'antsk']),
  apiKey: z.string().min(1, 'API Key不能为空'),
  baseUrl: z.string().url('无效的URL').optional(),
  enabled: z.boolean().optional(),
});

export const updateAIProviderSchema = z.object({
  name: z.string().min(1, 'Provider名称不能为空').max(50, 'Provider名称不能超过50个字符').optional(),
  apiKey: z.string().min(1, 'API Key不能为空').optional(),
  baseUrl: z.string().url('无效的URL').optional(),
  enabled: z.boolean().optional(),
});

export const generateImageSchema = z.object({
  prompt: z.string().min(1, '提示词不能为空').max(1000, '提示词不能超过1000个字符'),
  model: z.string().optional(),
  width: z.number().int().min(64).max(2048).optional(),
  height: z.number().int().min(64).max(2048).optional(),
  steps: z.number().int().min(1).max(100).optional(),
});

export const generateVideoSchema = z.object({
  prompt: z.string().min(1, '提示词不能为空').max(1000, '提示词不能超过1000个字符'),
  model: z.string().optional(),
  duration: z.number().int().min(1).max(60).optional(),
  fps: z.number().int().min(1).max(60).optional(),
});
