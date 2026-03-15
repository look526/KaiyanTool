import { Request, Response } from 'express'
import * as crypto from 'crypto'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

class ShotController {
  async getShots(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          OR: [
            { owner_id: req.user_id },
            { ProjectMember: { some: { user_id: req.user_id } } },
          ],
        },
      })

      if (!project) {
        logger.warn('项目不存在', { user_id: req.user_id, project_id })
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const shots = await prisma.shot.findMany({
        where: { project_id: project_id },
        include: {
          Scene: true,
          Character: true,
        },
        orderBy: [
          { chapter_number: 'asc' },
          { episode_number: 'asc' },
          { segment_id: 'asc' },
          { cell_id: 'asc' },
        ],
      })

      res.json(shots)
    } catch (error) {
      logger.error('获取分镜失败', { user_id: req.user_id, project_id: req.params.project_id, error })
      res.status(500).json({ error: 'Failed to get shots' })
    }
  }

  async getShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const shot = await prisma.shot.findFirst({
        where: {
          id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
        include: {
          Scene: true,
          Character: true,
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { user_id: req.user_id, shot_id: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      res.json(shot)
    } catch (error) {
      logger.error('获取分镜详情失败', { user_id: req.user_id, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to get shot' })
    }
  }

  async createShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params
      const {
        scene_id,
        character_id,
        chapter_number,
        episode_number,
        segment_id,
        cell_id,
        action_summary,
        camera_movement,
        start_prompt,
        end_prompt,
        duration,
        aspect_ratio,
        visual_style,
      } = req.body

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          owner_id: req.user_id,
        },
      })

      if (!project) {
        logger.warn('项目不存在', { user_id: req.user_id, project_id })
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const shot = await prisma.shot.create({
        data: {
          id: crypto.randomUUID(),
          project_id: project_id,
          scene_id,
          character_id,
          chapter_number,
          episode_number,
          segment_id,
          cell_id,
          action_summary,
          camera_movement,
          start_prompt,
          end_prompt,
          duration: duration ?? 8,
          aspect_ratio: aspect_ratio ?? '16:9',
          visual_style,
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          Scene: true,
          Character: true,
        },
      })

      res.status(201).json(shot)
      logger.info('分镜创建成功', { user_id: req.user_id, project_id, shotId: shot.id })
    } catch (error) {
      logger.error('创建分镜失败', { user_id: req.user_id, project_id: req.params.project_id, error })
      res.status(500).json({ error: 'Failed to create shot' })
    }
  }

  async updateShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const {
        scene_id,
        character_id,
        chapter_number,
        episode_number,
        segment_id,
        cell_id,
        action_summary,
        camera_movement,
        start_prompt,
        end_prompt,
        start_image_url,
        end_image_url,
        duration,
        aspect_ratio,
        visual_style,
      } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在或无权限', { user_id: req.user_id, shot_id: id })
        res.status(404).json({ error: 'Shot not found or unauthorized' })
        return
      }

      const updated = await prisma.shot.update({
        where: { id },
        data: {
          scene_id,
          character_id,
          chapter_number,
          episode_number,
          segment_id,
          cell_id,
          action_summary,
          camera_movement,
          start_prompt,
          end_prompt,
          start_image_url,
          end_image_url,
          duration,
          aspect_ratio,
          visual_style,
        },
        include: {
          Scene: true,
          Character: true,
        },
      })

      res.json(updated)
      logger.info('分镜更新成功', { user_id: req.user_id, shot_id: id })
    } catch (error) {
      logger.error('更新分镜失败', { user_id: req.user_id, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to update shot' })
    }
  }

  async deleteShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const shot = await prisma.shot.findFirst({
        where: {
          id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在或无权限', { user_id: req.user_id, shot_id: id })
        res.status(404).json({ error: 'Shot not found or unauthorized' })
        return
      }

      await prisma.shot.delete({
        where: { id },
      })

      res.json({ message: 'Shot deleted successfully' })
      logger.info('分镜删除成功', { user_id: req.user_id, shot_id: id })
    } catch (error) {
      logger.error('删除分镜失败', { user_id: req.user_id, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to delete shot' })
    }
  }

  async reorderShots(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params
      const { shots } = req.body

      if (!Array.isArray(shots)) {
        res.status(400).json({ error: 'Invalid shots data' })
        return
      }

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          OR: [
            { owner_id: req.user_id },
            { ProjectMember: { some: { user_id: req.user_id } } },
          ],
        },
      })

      if (!project) {
        logger.warn('项目不存在', { user_id: req.user_id, project_id })
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const updatePromises = shots.map((shot: any) =>
        prisma.shot.update({
          where: { id: shot.id },
          data: {
            chapter_number: shot.chapter_number,
            episode_number: shot.episode_number,
            segment_id: shot.segment_id,
            cell_id: shot.cell_id,
          },
        })
      )

      await Promise.all(updatePromises)

      res.json({ message: 'Shots reordered successfully' })
      logger.info('分镜重新排序成功', { user_id: req.user_id, project_id, count: shots.length })
    } catch (error) {
      logger.error('重新排序分镜失败', { user_id: req.user_id, project_id: req.params.project_id, error })
      res.status(500).json({ error: 'Failed to reorder shots' })
    }
  }

  async generateShotsFromScript(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params
      const { script_id } = req.body

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          owner_id: req.user_id,
        },
      })

      if (!project) {
        logger.warn('项目不存在', { user_id: req.user_id, project_id })
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const script = await prisma.script.findUnique({
        where: { id: script_id },
        include: { Scene: true },
      })

      if (!script) {
        res.status(404).json({ error: 'Script not found' })
        return
      }

      const generatedShots = []
      let sequence = 1

      for (const scene of script.Scene) {
        const shot = await prisma.shot.create({
          data: {
            id: crypto.randomUUID(),
            project_id: project_id,
            scene_id: scene.id,
            action_summary: scene.location || `Scene ${scene.id}`,
            duration: 8,
            aspect_ratio: '16:9',
            created_at: new Date(),
            updated_at: new Date(),
          },
        })
        generatedShots.push(shot)
        sequence++
      }

      res.status(201).json({
        shots: generatedShots,
        total: generatedShots.length,
      })
      logger.info('从剧本生成分镜成功', { user_id: req.user_id, project_id, script_id, count: generatedShots.length })
    } catch (error) {
      logger.error('从剧本生成分镜失败', { user_id: req.user_id, project_id: req.params.project_id, error })
      res.status(500).json({ error: 'Failed to generate shots' })
    }
  }

  async getShotsByEpisode(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { episodeId } = req.params

      const episode = await prisma.episode.findFirst({
        where: {
          id: episodeId,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!episode) {
        logger.warn('分集不存在', { user_id: req.user_id, episode_id: episodeId })
        res.status(404).json({ error: 'Episode not found' })
        return
      }

      const shots = await prisma.shot.findMany({
        where: {
          project_id: episode.project_id,
          episode_number: episode.episode_number,
        },
        include: {
          Scene: true,
          Character: true,
        },
        orderBy: [
          { chapter_number: 'asc' },
          { episode_number: 'asc' },
          { segment_id: 'asc' },
          { cell_id: 'asc' },
        ],
      })

      res.json(shots)
    } catch (error) {
      logger.error('获取分镜失败', { user_id: req.user_id, episode_id: req.params.episodeId, error })
      res.status(500).json({ error: 'Failed to get shots' })
    }
  }

  async createShotByEpisode(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { episodeId } = req.params
      const {
        scene_id,
        description,
        aspect_ratio,
        resolution,
      } = req.body

      const episode = await prisma.episode.findFirst({
        where: {
          id: episodeId,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!episode) {
        logger.warn('分集不存在', { user_id: req.user_id, episode_id: episodeId })
        res.status(404).json({ error: 'Episode not found' })
        return
      }

      const shot = await prisma.shot.create({
        data: {
          id: crypto.randomUUID(),
          project_id: episode.project_id,
          episode_number: episode.episode_number,
          scene_id,
          action_summary: description || '新分镜',
          aspect_ratio: aspect_ratio || '16:9',
          resolution: resolution || '1080p',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          Scene: true,
        },
      })

      res.status(201).json(shot)
      logger.info('分镜创建成功', { user_id: req.user_id, episode_id: episodeId, shotId: shot.id })
    } catch (error) {
      logger.error('创建分镜失败', { user_id: req.user_id, episode_id: req.params.episodeId, error })
      res.status(500).json({ error: 'Failed to create shot' })
    }
  }

  async batchGenerateShots(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { episodeId } = req.params
      const { provider_id, model, aspect_ratio, resolution } = req.body

      const episode = await prisma.episode.findFirst({
        where: {
          id: episodeId,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!episode) {
        logger.warn('分集不存在', { user_id: req.user_id, episode_id: episodeId })
        res.status(404).json({ error: 'Episode not found' })
        return
      }

      const shots = await prisma.shot.findMany({
        where: {
          project_id: episode.project_id,
          episode_number: episode.episode_number,
        },
      })

      let successful = 0
      let failed = 0

      for (const shot of shots) {
        try {
          await prisma.shot.update({
            where: { id: shot.id },
            data: {
              status: 'generating',
            },
          })
          successful++
        } catch (error) {
          logger.error('更新分镜状态失败', { shotId: shot.id, error })
          failed++
        }
      }

      res.json({
        success: true,
        successful,
        failed,
        total: shots.length,
      })
    } catch (error) {
      logger.error('批量生成分镜失败', { user_id: req.user_id, episode_id: req.params.episodeId, error })
      res.status(500).json({ error: 'Failed to batch generate shots' })
    }
  }

  async reorderShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { order } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在或无权限', { user_id: req.user_id, shot_id: id })
        res.status(404).json({ error: 'Shot not found or unauthorized' })
        return
      }

      await prisma.shot.update({
        where: { id },
        data: {
          cell_id: order,
        },
      })

      res.json({ message: 'Shot reordered successfully' })
      logger.info('分镜重新排序成功', { user_id: req.user_id, shot_id: id })
    } catch (error) {
      logger.error('重新排序分镜失败', { user_id: req.user_id, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to reorder shot' })
    }
  }
}

export const shotController = new ShotController()
