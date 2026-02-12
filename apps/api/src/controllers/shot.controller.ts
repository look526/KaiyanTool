import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

class ShotController {
  async getShots(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId } = req.params

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId } } },
          ],
        },
      })

      if (!project) {
        logger.warn('项目不存在', { userId: req.userId, projectId })
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const shots = await prisma.shot.findMany({
        where: { projectId },
        include: {
          scene: true,
          character: true,
        },
        orderBy: [
          { chapterNumber: 'asc' },
          { episodeNumber: 'asc' },
          { segmentId: 'asc' },
          { cellId: 'asc' },
        ],
      })

      res.json(shots)
    } catch (error) {
      logger.error('获取分镜失败', { userId: req.userId, projectId: req.params.projectId, error })
      res.status(500).json({ error: 'Failed to get shots' })
    }
  }

  async getShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const shot = await prisma.shot.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId } } },
            ],
          },
        },
        include: {
          scene: true,
          character: true,
          panels: {
            orderBy: { position: 'asc' },
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { userId: req.userId, shotId: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      res.json(shot)
    } catch (error) {
      logger.error('获取分镜详情失败', { userId: req.userId, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to get shot' })
    }
  }

  async createShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId } = req.params
      const {
        sceneId,
        characterId,
        chapterNumber,
        episodeNumber,
        segmentId,
        cellId,
        actionSummary,
        cameraMovement,
        startPrompt,
        endPrompt,
        duration,
        aspectRatio,
        visualStyle,
      } = req.body

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: req.userId,
        },
      })

      if (!project) {
        logger.warn('项目不存在', { userId: req.userId, projectId })
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const shot = await prisma.shot.create({
        data: {
          projectId,
          sceneId,
          characterId,
          chapterNumber,
          episodeNumber,
          segmentId,
          cellId,
          actionSummary,
          cameraMovement,
          startPrompt,
          endPrompt,
          duration: duration ?? 8,
          aspectRatio: aspectRatio ?? '16:9',
          visualStyle,
        },
        include: {
          scene: true,
          character: true,
        },
      })

      res.status(201).json(shot)
      logger.info('分镜创建成功', { userId: req.userId, projectId, shotId: shot.id })
    } catch (error) {
      logger.error('创建分镜失败', { userId: req.userId, projectId: req.params.projectId, error })
      res.status(500).json({ error: 'Failed to create shot' })
    }
  }

  async updateShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const {
        sceneId,
        characterId,
        chapterNumber,
        episodeNumber,
        segmentId,
        cellId,
        actionSummary,
        cameraMovement,
        startPrompt,
        endPrompt,
        startImageUrl,
        endImageUrl,
        duration,
        aspectRatio,
        visualStyle,
      } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId } } },
            ],
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在或无权限', { userId: req.userId, shotId: id })
        res.status(404).json({ error: 'Shot not found or unauthorized' })
        return
      }

      const updated = await prisma.shot.update({
        where: { id },
        data: {
          sceneId,
          characterId,
          chapterNumber,
          episodeNumber,
          segmentId,
          cellId,
          actionSummary,
          cameraMovement,
          startPrompt,
          endPrompt,
          startImageUrl,
          endImageUrl,
          duration,
          aspectRatio,
          visualStyle,
        },
        include: {
          scene: true,
          character: true,
        },
      })

      res.json(updated)
      logger.info('分镜更新成功', { userId: req.userId, shotId: id })
    } catch (error) {
      logger.error('更新分镜失败', { userId: req.userId, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to update shot' })
    }
  }

  async deleteShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const shot = await prisma.shot.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId } } },
            ],
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在或无权限', { userId: req.userId, shotId: id })
        res.status(404).json({ error: 'Shot not found or unauthorized' })
        return
      }

      await prisma.shot.delete({
        where: { id },
      })

      res.json({ message: 'Shot deleted successfully' })
      logger.info('分镜删除成功', { userId: req.userId, shotId: id })
    } catch (error) {
      logger.error('删除分镜失败', { userId: req.userId, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to delete shot' })
    }
  }

  async reorderShots(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId } = req.params
      const { shots } = req.body

      if (!Array.isArray(shots)) {
        res.status(400).json({ error: 'Invalid shots data' })
        return
      }

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId } } },
          ],
        },
      })

      if (!project) {
        logger.warn('项目不存在', { userId: req.userId, projectId })
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const updatePromises = shots.map((shot: any) =>
        prisma.shot.update({
          where: { id: shot.id },
          data: {
            chapterNumber: shot.chapterNumber,
            episodeNumber: shot.episodeNumber,
            segmentId: shot.segmentId,
            cellId: shot.cellId,
          },
        })
      )

      await Promise.all(updatePromises)

      res.json({ message: 'Shots reordered successfully' })
      logger.info('分镜重新排序成功', { userId: req.userId, projectId, count: shots.length })
    } catch (error) {
      logger.error('重新排序分镜失败', { userId: req.userId, projectId: req.params.projectId, error })
      res.status(500).json({ error: 'Failed to reorder shots' })
    }
  }

  async generateShotsFromScript(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId } = req.params
      const { scriptId } = req.body

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: req.userId,
        },
      })

      if (!project) {
        logger.warn('项目不存在', { userId: req.userId, projectId })
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const script = await prisma.script.findUnique({
        where: { id: scriptId },
        include: { scenes: true },
      })

      if (!script) {
        res.status(404).json({ error: 'Script not found' })
        return
      }

      const generatedShots = []
      let sequence = 1

      for (const scene of script.scenes) {
        const shot = await prisma.shot.create({
          data: {
            projectId,
            sceneId: scene.id,
            actionSummary: scene.description || `Scene ${scene.id}`,
            duration: 8,
            aspectRatio: '16:9',
          },
        })
        generatedShots.push(shot)
        sequence++
      }

      res.status(201).json({
        shots: generatedShots,
        total: generatedShots.length,
      })
      logger.info('从剧本生成分镜成功', { userId: req.userId, projectId, scriptId, count: generatedShots.length })
    } catch (error) {
      logger.error('从剧本生成分镜失败', { userId: req.userId, projectId: req.params.projectId, error })
      res.status(500).json({ error: 'Failed to generate shots' })
    }
  }
}

export const shotController = new ShotController()
