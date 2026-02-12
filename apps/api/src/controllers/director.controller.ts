import { Request, Response } from 'express'
import { directorAgent } from '../agents/director.agent'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

class DirectorController {
  async generateScript(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId, storyOutline, genre, characters, settings } = req.body

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
          ],
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found or no permission' })
        return
      }

      // 生成剧本
      const scriptContent = await directorAgent.generateScript(
        req.userId,
        projectId,
        storyOutline,
        genre,
        characters,
        settings
      )

      // 保存剧本到数据库
      const script = await prisma.script.create({
        data: {
          projectId,
          title: `生成的剧本 - ${new Date().toLocaleString()}`,
          content: scriptContent,
        },
      })

      logger.info('剧本生成成功', { userId: req.userId, projectId, scriptId: script.id })
      res.status(201).json(script)
    } catch (error) {
      logger.error('生成剧本失败', { error, projectId: req.body.projectId })
      res.status(500).json({ error: 'Failed to generate script' })
    }
  }

  async generateShots(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId, scriptContent, visualStyle } = req.body

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
          ],
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found or no permission' })
        return
      }

      // 生成镜头
      const shots = await directorAgent.generateShotsFromScript(
        req.userId,
        projectId,
        scriptContent,
        visualStyle
      )

      logger.info('镜头生成成功', { userId: req.userId, projectId, shotCount: shots.length })
      res.status(201).json({ shots })
    } catch (error) {
      logger.error('生成镜头失败', { error, projectId: req.body.projectId })
      res.status(500).json({ error: 'Failed to generate shots' })
    }
  }

  async optimizeShotPrompt(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId, referenceImages } = req.body

      // 优化镜头提示词
      const optimizedPrompts = await directorAgent.optimizeShotPrompt(
        req.userId,
        shotId,
        referenceImages
      )

      // 更新镜头提示词
      await prisma.shot.update({
        where: { id: shotId },
        data: {
          startPrompt: optimizedPrompts.startPrompt,
          endPrompt: optimizedPrompts.endPrompt,
        },
      })

      logger.info('镜头提示词优化成功', { userId: req.userId, shotId })
      res.json(optimizedPrompts)
    } catch (error) {
      logger.error('优化镜头提示词失败', { error, shotId: req.body.shotId })
      res.status(500).json({ error: 'Failed to optimize shot prompt' })
    }
  }
}

export const directorController = new DirectorController()