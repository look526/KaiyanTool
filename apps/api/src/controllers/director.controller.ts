import { Request, Response } from 'express'
import * as crypto from 'crypto'
import { directorAgent } from '../agents/director.agent'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

class DirectorController {
  async generateScript(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id, storyOutline, genre, characters, settings } = req.body

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          OR: [
            { owner_id: req.user_id },
            { ProjectMember: { some: { user_id: req.user_id, role: { in: ['owner', 'editor'] } } } },
          ],
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found or no permission' })
        return
      }

      // 生成剧本
      const scriptContent = await directorAgent.generateScript(
        req.user_id,
        project_id,
        storyOutline,
        genre,
        characters,
        settings
      )

      // 保存剧本到数据库
      const script = await prisma.script.create({
        data: {
          id: crypto.randomUUID(),
          project_id,
          title: `生成的剧本 - ${new Date().toLocaleString()}`,
          content: scriptContent,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      logger.info('剧本生成成功', { user_id: req.user_id, project_id, script_id: script.id })
      res.status(201).json(script)
    } catch (error) {
      logger.error('生成剧本失败', { error, project_id: req.body.project_id })
      res.status(500).json({ error: 'Failed to generate script' })
    }
  }

  async generateShots(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id, scriptContent, visualStyle } = req.body

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          OR: [
            { owner_id: req.user_id },
            { ProjectMember: { some: { user_id: req.user_id, role: { in: ['owner', 'editor'] } } } },
          ],
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found or no permission' })
        return
      }

      // 生成镜头
      const shots = await directorAgent.generateShotsFromScript(
        req.user_id,
        project_id,
        scriptContent,
        visualStyle
      )

      logger.info('镜头生成成功', { user_id: req.user_id, project_id, shot_count: shots.length })
      res.status(201).json({ shots })
    } catch (error) {
      logger.error('生成镜头失败', { error, project_id: req.body.project_id })
      res.status(500).json({ error: 'Failed to generate shots' })
    }
  }

  async optimizeShotPrompt(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id, referenceImages } = req.body

      // 优化镜头提示词
      const optimizedPrompts = await directorAgent.optimizeShotPrompt(
        req.user_id,
        shot_id,
        referenceImages
      )

      // 更新镜头提示词
      await prisma.shot.update({
        where: { id: shot_id },
        data: {
          start_prompt: optimizedPrompts.startPrompt,
          end_prompt: optimizedPrompts.endPrompt,
        },
      })

      logger.info('镜头提示词优化成功', { user_id: req.user_id, shot_id })
      res.json(optimizedPrompts)
    } catch (error) {
      logger.error('优化镜头提示词失败', { error, shot_id: req.body.shot_id })
      res.status(500).json({ error: 'Failed to optimize shot prompt' })
    }
  }
}

export const directorController = new DirectorController()