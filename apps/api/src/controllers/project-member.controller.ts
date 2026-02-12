import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { MemberRole } from '@prisma/client'
import logger from '../lib/logger'

export class ProjectMemberController {
  async addMember(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params
      const { userId, role = 'viewer' } = req.body
      const requesterId = (req as any).user?.id

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (!project) {
        logger.warn('项目不存在', { requesterId, projectId })
        res.status(404).json({ error: '项目不存在' })
        return
      }

      if (project.ownerId !== requesterId) {
        logger.warn('无权限添加成员', { requesterId, projectId, userId })
        res.status(403).json({ error: '只有项目所有者可以添加成员' })
        return
      }

      const existingMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      })

      if (existingMember) {
        logger.warn('用户已是项目成员', { requesterId, projectId, userId })
        res.status(400).json({ error: '用户已经是项目成员' })
        return
      }

      const member = await prisma.projectMember.create({
        data: {
          projectId,
          userId,
          role: role as MemberRole,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      })

      res.status(201).json(member)
      logger.info('添加成员成功', { requesterId, projectId, userId, role })
    } catch (error) {
      logger.error('添加成员失败', { requesterId: (req as any).user?.id, projectId: req.params.projectId, error })
      res.status(500).json({ error: '添加成员失败' })
    }
  }

  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId } = req.params
      const requesterId = (req as any).user?.id

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (!project) {
        logger.warn('项目不存在', { requesterId, projectId })
        res.status(404).json({ error: '项目不存在' })
        return
      }

      if (project.ownerId !== requesterId && userId !== requesterId) {
        logger.warn('无权限移除成员', { requesterId, projectId, userId })
        res.status(403).json({ error: '无权限移除此成员' })
        return
      }

      await prisma.projectMember.delete({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      })

      res.status(204).send()
      logger.info('移除成员成功', { requesterId, projectId, userId })
    } catch (error) {
      logger.error('移除成员失败', { requesterId: (req as any).user?.id, projectId: req.params.projectId, userId: req.params.userId, error })
      res.status(500).json({ error: '移除成员失败' })
    }
  }

  async updateMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId } = req.params
      const { role } = req.body
      const requesterId = (req as any).user?.id

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (!project) {
        logger.warn('项目不存在', { requesterId, projectId })
        res.status(404).json({ error: '项目不存在' })
        return
      }

      if (project.ownerId !== requesterId) {
        logger.warn('无权限更新成员角色', { requesterId, projectId, userId })
        res.status(403).json({ error: '只有项目所有者可以更新成员角色' })
        return
      }

      if (userId === requesterId) {
        logger.warn('不能修改自己的角色', { requesterId, projectId, userId })
        res.status(400).json({ error: '不能修改自己的角色' })
        return
      }

      const member = await prisma.projectMember.update({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
        data: {
          role: role as MemberRole,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      })

      res.json(member)
      logger.info('更新成员角色成功', { requesterId, projectId, userId, role })
    } catch (error) {
      logger.error('更新成员角色失败', { requesterId: (req as any).user?.id, projectId: req.params.projectId, userId: req.params.userId, error })
      res.status(500).json({ error: '更新成员角色失败' })
    }
  }

  async getProjectMembers(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params

      const members = await prisma.projectMember.findMany({
        where: {
          projectId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          joinedAt: 'asc',
        },
      })

      res.json(members)
    } catch (error) {
      logger.error('获取项目成员失败', { projectId: req.params.projectId, error })
      res.status(500).json({ error: '获取项目成员失败' })
    }
  }

  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query

      if (!q || typeof q !== 'string' || q.length < 2) {
        res.json([])
        return
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              email: {
                contains: q,
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: q,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
        take: 10,
      })

      res.json(users)
    } catch (error) {
      logger.error('搜索用户失败', { query: req.query.q, error })
      res.status(500).json({ error: '搜索用户失败' })
    }
  }
}

export const projectMemberController = new ProjectMemberController()
