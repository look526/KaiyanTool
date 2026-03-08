import { Request, Response } from 'express';
import crypto from 'crypto';
import logger from '../lib/logger';
import { auditService, AuditAction, AuditResource } from '../services/audit.service';
import { prisma } from '../lib/prisma';
// 直接使用 any 类型，避免循环引用
import { ProjectResponseDTO } from '../types/dto/response/project.dto';

const ProjectTypeValues = ['script', 'novel', 'mixed'] as const;

export const createProject = async (req: Request, res: Response) => {
  const currentUser = (req as any).userId || req.user?.id;
  let { name, description, type } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '项目名称是必填项' } });
    }

    if (!currentUser) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } });
    }

    type = type?.toLowerCase();
    
    if (type && !ProjectTypeValues.includes(type as any)) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '无效的项目类型' } });
    }

    const project = await prisma.project.create({
      data: {
        id: crypto.randomUUID(),
        name,
        description: description || '',
        type: type || 'script',
        owner_id: currentUser,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        status: true,
        thumbnail_url: true,
        created_at: true,
        updated_at: true,
        User: {
          select: { id: true, name: true },
        },
        _count: {
          select: { Shot: true, Character: true },
        },
      },
    });

    const response = ProjectResponseDTO.fromProjectListItem(project);
    res.status(201).json({ success: true, data: response });
    logger.info('项目创建成功', { userId: currentUser, projectId: project.id, name });
  } catch (error) {
    logger.error('创建项目失败', { userId: currentUser, error });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: '创建项目失败' } });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  console.log('=== getProjects 被调用 ===');
  const currentUser = (req as any).userId || req.user?.id;
  console.log('currentUser:', currentUser);
  let { page = '1', limit = '10', search, type } = req.query;

  try {
    if (!currentUser) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    console.log('开始获取项目列表', { currentUser, pageNum, limitNum, skip });

    const where: any = {
      OR: [
        { owner_id: currentUser },
        { ProjectMember: { some: { user_id: currentUser } } },
      ],
    };

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    type = type?.toString().toLowerCase();
    
    if (type && ProjectTypeValues.includes(type as any)) {
      where.type = type;
    }

    try {
      const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          status: true,
          thumbnail_url: true,
          created_at: true,
          updated_at: true,
          User: {
            select: { id: true, name: true },
          },
          _count: {
            select: { Shot: true, Character: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    console.log('查询完成:', { projectsCount: projects?.length, total });
    logger.info('查询完成', { userId: currentUser, projectsCount: projects?.length, total });

    const response = ProjectResponseDTO.toListResponse(
      projects,
      total,
      pageNum,
      limitNum
    );
    console.log('转换完成，准备返回');
    logger.info('获取项目列表成功', { userId: currentUser, count: projects.length, total });
    res.json(response);
    } catch (transformError) {
      logger.error('查询或转换项目数据失败', { 
        userId: currentUser, 
        transformError: transformError instanceof Error ? transformError.message : String(transformError),
        transformStack: transformError instanceof Error ? transformError.stack : undefined,
        transformErrorType: transformError?.constructor?.name,
        transformErrorKeys: transformError ? Object.keys(transformError) : []
      });
      res.status(500).json({ success: false, error: { code: 'TRANSFORM_ERROR', message: '获取项目列表失败' } });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorType = error?.constructor?.name;
    
    console.error('=== 获取项目列表失败 ===');
    console.error('errorMessage:', errorMessage);
    console.error('errorStack:', errorStack);
    console.error('errorType:', errorType);
    
    logger.error('获取项目列表失败', { 
      userId: currentUser, 
      errorMessage,
      errorType,
      stack: errorStack
    });
    
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: errorMessage } });
  }
};

export const getProject = async (req: Request, res: Response) => {
  const currentUser = (req as any).userId || req.user?.id;
  const { id } = req.params;

  try {
    if (!currentUser) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { owner_id: currentUser },
          { ProjectMember: { some: { user_id: currentUser } } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        status: true,
        settings: true,
        thumbnail_url: true,
        created_at: true,
        updated_at: true,
        User: {
          select: { id: true, name: true },
        },
        _count: {
          select: { Shot: true, Character: true, ProjectMember: true },
        },
      },
    });

    if (!project) {
      logger.warn('项目不存在', { userId: currentUser, projectId: id });
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '项目不存在' } });
    }

    const response = ProjectResponseDTO.fromProjectListItem(project);
    res.json({ success: true, data: response });
  } catch (error) {
    logger.error('获取项目详情失败', { userId: currentUser, projectId: id, error });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: '获取项目详情失败' } });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const currentUser = (req as any).userId || req.user?.id;
  const { id } = req.params;
  let { name, description, type } = req.body;

  try {
    if (!currentUser) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } });
    }

    const project = await prisma.project.findFirst({
      where: { id, owner_id: currentUser },
    });

    if (!project) {
      logger.warn('项目不存在或无权限', { userId: currentUser, projectId: id });
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '项目不存在或无权限' } });
    }

    type = type?.toLowerCase();
    
    if (type && !ProjectTypeValues.includes(type as any)) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '无效的项目类型' } });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        status: true,
        thumbnail_url: true,
        created_at: true,
        updated_at: true,
        User: {
          select: { id: true, name: true },
        },
        _count: {
          select: { Shot: true, Character: true },
        },
      },
    });

    const response = ProjectResponseDTO.fromProjectListItem(updatedProject);
    res.json({ success: true, data: response });
    logger.info('项目更新成功', { userId: currentUser, projectId: id });
  } catch (error) {
    logger.error('更新项目失败', { userId: currentUser, projectId: id, error });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: '更新项目失败' } });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const currentUser = (req as any).userId || req.user?.id;
  const { id } = req.params;

  try {
    if (!currentUser) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } });
    }

    const project = await prisma.project.findFirst({
      where: { id, owner_id: currentUser },
    });

    if (!project) {
      logger.warn('项目不存在或无权限', { userId: currentUser, projectId: id });
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '项目不存在或无权限' } });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({ success: true, data: { message: '项目已删除' } });
    logger.info('项目删除成功', { userId: currentUser, projectId: id });
    await auditService.logAction(req, AuditAction.DELETE, AuditResource.PROJECT, id, { name: project.name });
  } catch (error) {
    logger.error('删除项目失败', { userId: currentUser, projectId: id, error });
    await auditService.logError(req, AuditAction.DELETE, AuditResource.PROJECT, '删除项目失败', id, { error });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: '删除项目失败' } });
  }
};
