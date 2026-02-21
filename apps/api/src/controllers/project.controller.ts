import { Request, Response } from 'express';
import logger from '../lib/logger';
import { auditService, AuditAction, AuditResource } from '../services/audit.service';
import { prisma } from '../lib/prisma';

const ProjectTypeValues = ['script', 'novel', 'mixed'] as const;

export const createProject = async (req: Request, res: Response) => {
  const currentUser = (req as any).userId || req.user?.id;
  let { name, description, type } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: '项目名称是必填项' });
    }

    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    type = type?.toLowerCase();
    
    if (type && !ProjectTypeValues.includes(type as any)) {
      return res.status(400).json({ error: '无效的项目类型' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || '',
        type: type || 'script',
        owner: { connect: { id: currentUser } },
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    res.status(201).json(project);
    logger.info('项目创建成功', { userId: currentUser, projectId: project.id, name });
  } catch (error) {
    logger.error('创建项目失败', { userId: currentUser, error });
    res.status(500).json({ error: '创建项目失败' });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  const currentUser = req.user?.id;
  let { page = '1', limit = '10', search, type } = req.query;

  try {
    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      OR: [
        { ownerId: currentUser },
        { members: { some: { userId: currentUser } } },
      ],
    };

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    type = type?.toString().toLowerCase();
    
    if (type && ProjectTypeValues.includes(type as any)) {
      where.type = type;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: { id: true, email: true, name: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, email: true, name: true },
              },
            },
          },
          _count: {
            select: { shots: true, characters: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('获取项目列表失败', { userId: currentUser, error });
    res.status(500).json({ error: '获取项目列表失败' });
  }
};

export const getProject = async (req: Request, res: Response) => {
  const currentUser = req.user?.id;
  const { id } = req.params;

  try {
    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: currentUser },
          { members: { some: { userId: currentUser } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
        shots: {
          orderBy: { createdAt: 'asc' },
          take: 10,
        },
        characters: {
          take: 10,
        },
        _count: {
          select: { shots: true, characters: true, members: true },
        },
      },
    });

    if (!project) {
      logger.warn('项目不存在', { userId: currentUser, projectId: id });
      return res.status(404).json({ error: '项目不存在' });
    }

    res.json(project);
  } catch (error) {
    logger.error('获取项目详情失败', { userId: currentUser, projectId: id, error });
    res.status(500).json({ error: '获取项目详情失败' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const currentUser = (req as any).userId || req.user?.id;
  const { id } = req.params;
  let { name, description, type } = req.body;

  try {
    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    const project = await prisma.project.findFirst({
      where: { id, ownerId: currentUser },
    });

    if (!project) {
      logger.warn('项目不存在或无权限', { userId: currentUser, projectId: id });
      return res.status(404).json({ error: '项目不存在或无权限' });
    }

    type = type?.toLowerCase();
    
    if (type && !ProjectTypeValues.includes(type as any)) {
      return res.status(400).json({ error: '无效的项目类型' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    res.json(updatedProject);
    logger.info('项目更新成功', { userId: currentUser, projectId: id });
  } catch (error) {
    logger.error('更新项目失败', { userId: currentUser, projectId: id, error });
    res.status(500).json({ error: '更新项目失败' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const currentUser = req.user?.id;
  const { id } = req.params;

  try {
    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    const project = await prisma.project.findFirst({
      where: { id, ownerId: currentUser },
    });

    if (!project) {
      logger.warn('项目不存在或无权限', { userId: currentUser, projectId: id });
      return res.status(404).json({ error: '项目不存在或无权限' });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: '项目已删除' });
    logger.info('项目删除成功', { userId: currentUser, projectId: id });
    await auditService.logAction(req, AuditAction.DELETE, AuditResource.PROJECT, id, { name: project.name });
  } catch (error) {
    logger.error('删除项目失败', { userId: currentUser, projectId: id, error });
    await auditService.logError(req, AuditAction.DELETE, AuditResource.PROJECT, '删除项目失败', id, { error });
    res.status(500).json({ error: '删除项目失败' });
  }
};
