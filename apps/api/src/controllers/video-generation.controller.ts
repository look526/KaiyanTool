import { Request, Response } from 'express'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'
import { providerManager } from '../services/ai/provider.manager'
import axios from 'axios'
import { createWriteStream, unlinkSync } from 'fs'
import { promisify } from 'util'
import stream from 'stream'
import { join } from 'path'
import { tmpdir } from 'os'
import JSZip from 'jszip'
import { Readable } from 'stream'

const pipeline = promisify(stream.pipeline)

class VideoGenerationController {
  async generateVideo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { providerId, duration, motion } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
          Project: {
            owner_id: req.user_id,
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { userId: req.user_id, shotId: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!shot.start_image_url || !shot.end_image_url) {
        res.status(400).json({ error: 'Start and end images must be generated first' })
        return
      }

      const video = await prisma.video.create({
        data: {
          id: crypto.randomUUID(),
          shot_id: id,
          project_id: shot.project_id,
          url: '',
          status: 'processing',
          format: 'mp4',
          duration: duration || 5,
        },
      })

      const provider = providerId ? providerManager.getProvider(providerId) : undefined

      if (!provider) {
        await prisma.video.update({
          where: { id: video.id },
          data: { status: 'failed' },
        })
        res.status(400).json({ error: 'No AI provider configured' })
        return
      }

      try {
        const result = await provider.createVideo({
          imageUrl: shot.start_image_url,
          prompt: shot.action_summary || undefined,
          duration: duration || 5,
          motion: motion || 5,
          aspectRatio: '16:9',
        })

        await prisma.video.update({
          where: { id: video.id },
          data: {
            status: 'completed',
            url: result.url,
            duration: result.duration || duration || 5,
          },
        })

        logger.info('视频生成成功', { userId: req.user_id, shotId: id, video_id: video.id })
        res.json({
          video_id: video.id,
          status: 'completed',
          url: result.url,
          duration: result.duration,
        })
      } catch (error) {
        await prisma.video.update({
          where: { id: video.id },
          data: {
            status: 'failed',
          },
        })
        logger.error('视频生成失败', { userId: req.user_id, shotId: id, video_id: video.id, error })
        res.status(500).json({ error: 'Video generation failed', details: error instanceof Error ? error.message : 'Unknown error' })
      }
    } catch (error) {
      logger.error('生成视频失败', { userId: req.user_id, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate video' })
    }
  }

  async getVideoStatus(req: Request, res: Response): Promise<void> {
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
            owner_id: req.user_id,
          },
        },
        select: {
          id: true,
          project_id: true,
          scene_id: true,
          character_id: true,
          action_summary: true,
          start_prompt: true,
          end_prompt: true,
          start_image_url: true,
          end_image_url: true,
          video_url: true,
          duration: true,
          aspect_ratio: true,
          Video: {
            select: {
              id: true,
              shot_id: true,
              url: true,
              status: true,
              duration: true,
              format: true,
            },
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { userId: req.user_id, shotId: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!shot.Video) {
        res.status(404).json({ error: 'Video not found' })
        return
      }

      const video = shot.Video
      res.json({
        video_id: video?.id,
        status: video?.status,
        url: video?.url,
        duration: video?.duration,
        format: video?.format,
      })
    } catch (error) {
      logger.error('获取视频状态失败', { userId: req.user_id, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to get video status' })
    }
  }

  async getProjectVideos(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          owner_id: req.user_id,
        },
      })

      if (!project) {
        logger.warn('项目不存在', { userId: req.user_id, project_id })
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const videos = await prisma.video.findMany({
        where: { project_id: project_id },
        select: {
          id: true,
          project_id: true,
          shot_id: true,
          url: true,
          status: true,
          duration: true,
          created_at: true,
          Shot: {
            select: {
              id: true,
              action_summary: true,
              start_image_url: true,
              end_image_url: true,
              duration: true,
              aspect_ratio: true,
              Scene: {
                select: {
                  id: true,
                  location: true,
                  time: true,
                  atmosphere: true,
                },
              },
              Character: {
                select: {
                  id: true,
                  name: true,
                  appearance: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      })

      res.json({ success: true, data: videos })
    } catch (error) {
      logger.error('获取项目视频失败', { userId: req.user_id, project_id: req.params.project_id, error })
      res.status(500).json({ error: 'Failed to get project videos' })
    }
  }

  async deleteVideo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const video = await prisma.video.findFirst({
        where: {
          id,
          Project: {
            owner_id: req.user_id,
          },
        },
      })

      if (!video) {
        logger.warn('视频不存在或无权限', { userId: req.user_id, video_id: id })
        res.status(404).json({ error: 'Video not found or unauthorized' })
        return
      }

      await prisma.video.delete({
        where: { id },
      })

      res.json({ message: 'Video deleted successfully' })
      logger.info('视频删除成功', { userId: req.user_id, video_id: id })
    } catch (error) {
      logger.error('删除视频失败', { userId: req.user_id, video_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to delete video' })
    }
  }

  async exportVideo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { format = 'mp4', resolution = '1080p' } = req.query

      const video = await prisma.video.findFirst({
        where: {
          id,
          Project: {
            owner_id: req.user_id,
          },
        },
      })

      if (!video) {
        res.status(404).json({ error: 'Video not found or unauthorized' })
        return
      }

      if (!video.url) {
        res.status(400).json({ error: 'Video URL not available' })
        return
      }

      const validFormats = ['mp4', 'webm', 'mov']
      const validResolutions = ['720p', '1080p', '4k']

      if (!validFormats.includes(format as string)) {
        res.status(400).json({ error: 'Invalid format. Supported: mp4, webm, mov' })
        return
      }

      if (!validResolutions.includes(resolution as string)) {
        res.status(400).json({ error: 'Invalid resolution. Supported: 720p, 1080p, 4k' })
        return
      }

      const tempDir = tmpdir()
      const fileName = `video_${id}_${resolution}.${format}`
      const filePath = join(tempDir, fileName)

      try {
        const response = await axios({
          method: 'GET',
          url: video.url,
          responseType: 'stream',
        })

        await pipeline(response.data, createWriteStream(filePath))

        res.download(filePath, fileName, (err) => {
          if (err) {
            logger.error('视频导出失败', { userId: req.user_id, video_id: id, error: err })
          }
          try {
            unlinkSync(filePath)
          } catch (e) {
            logger.warn('临时文件删除失败', { filePath })
          }
        })

        logger.info('视频导出成功', { userId: req.user_id, video_id: id, format, resolution })
      } catch (downloadError) {
        res.status(500).json({ error: 'Failed to download video' })
        logger.error('视频下载失败', { userId: req.user_id, video_id: id, error: downloadError })
      }
    } catch (error) {
      logger.error('导出视频失败', { userId: req.user_id, video_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to export video' })
    }
  }

  async exportProjectVideos(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params
      const { format = 'mp4', resolution = '1080p' } = req.query

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          owner_id: req.user_id,
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found or unauthorized' })
        return
      }

      const videos = await prisma.video.findMany({
        where: {
          project_id: project_id,
          status: 'completed',
          url: { not: null },
        },
      })

      if (videos.length === 0) {
        res.status(404).json({ error: 'No completed videos found in project' })
        return
      }

      const validFormats = ['mp4', 'webm', 'mov']
      const validResolutions = ['720p', '1080p', '4k']

      if (!validFormats.includes(format as string)) {
        res.status(400).json({ error: 'Invalid format. Supported: mp4, webm, mov' })
        return
      }

      if (!validResolutions.includes(resolution as string)) {
        res.status(400).json({ error: 'Invalid resolution. Supported: 720p, 1080p, 4k' })
        return
      }

      const zip = new JSZip()
      const tempDir = tmpdir()
      const zipFileName = `${project.name}_videos_${resolution}.zip`
      const zipPath = join(tempDir, zipFileName)

      try {
        for (const video of videos) {
          if (video.url) {
            const response = await axios({
              method: 'GET',
              url: video.url,
              responseType: 'arraybuffer',
            })

            const fileName = `shot_${video.shot_id}_${resolution}.${format}`
            zip.file(fileName, response.data)
          }
        }

        const zipContent = await zip.generateAsync({ type: 'nodebuffer' })
        const writeStream = createWriteStream(zipPath)
        await pipeline(Readable.from(zipContent), writeStream)

        res.download(zipPath, zipFileName, (err) => {
          if (err) {
            logger.error('项目视频导出失败', { userId: req.user_id, project_id, error: err })
          }
          try {
            unlinkSync(zipPath)
          } catch (e) {
            logger.warn('临时ZIP文件删除失败', { zipPath })
          }
        })

        logger.info('项目视频导出成功', { userId: req.user_id, project_id, count: videos.length, format, resolution })
      } catch (zipError) {
        res.status(500).json({ error: 'Failed to create ZIP archive' })
        logger.error('创建ZIP失败', { userId: req.user_id, project_id, error: zipError })
      }
    } catch (error) {
      logger.error('导出项目视频失败', { userId: req.user_id, project_id: req.params.project_id, error })
      res.status(500).json({ error: 'Failed to export project videos' })
    }
  }

  async createMergeTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params
      const { video_ids } = req.body

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          owner_id: req.user_id,
        },
      })

      if (!project) {
        logger.warn('项目不存在', { userId: req.user_id, project_id })
        res.status(404).json({ error: 'Project not found' })
        return
      }

      if (!Array.isArray(video_ids) || video_ids.length === 0) {
        res.status(400).json({ error: 'video_ids must be a non-empty array' })
        return
      }

      const mergeTask = await prisma.videoMergeTask.create({
        data: {
          id: crypto.randomUUID(),
          project_id: project_id,
          video_ids: video_ids,
          status: 'pending',
        },
      })

      res.status(201).json(mergeTask)
      logger.info('创建合并任务成功', { userId: req.user_id, project_id, taskId: mergeTask.id, count: video_ids.length })
    } catch (error) {
      logger.error('创建合并任务失败', { userId: req.user_id, project_id: req.params.project_id, error })
      res.status(500).json({ error: 'Failed to create merge task' })
    }
  }

  async getMergeTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const mergeTask = await prisma.videoMergeTask.findFirst({
        where: {
          id,
          Project: {
            owner_id: req.user_id,
          },
        },
      })

      if (!mergeTask) {
        logger.warn('合并任务不存在', { userId: req.user_id, taskId: id })
        res.status(404).json({ error: 'Merge task not found' })
        return
      }

      res.json({
        id: mergeTask.id,
        status: mergeTask.status,
        outputUrl: mergeTask.output_url,
        errorMessage: mergeTask.error_message,
        createdAt: mergeTask.created_at,
        completedAt: mergeTask.completed_at,
      })
    } catch (error) {
      logger.error('获取合并任务状态失败', { userId: req.user_id, taskId: req.params.id, error })
      res.status(500).json({ error: 'Failed to get merge task status' })
    }
  }
}

export const videoGenerationController = new VideoGenerationController()
