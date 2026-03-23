import { Request, Response } from 'express'
import * as timelineService from '../services/timeline.service'
import logger from '../lib/logger'

class TimelineController {
  /**
   * @description 为一集创建/更新时间线（自动加载所有素材）
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { project_id, episode_id } = req.params
      const timeline = await timelineService.createTimelineForEpisode(episode_id, project_id)
      res.json({ success: true, data: timeline })
    } catch (error) {
      logger.error('创建时间线失败', { error })
      res.status(500).json({ error: '创建时间线失败' })
    }
  }

  /**
   * @description 获取时间线
   */
  async get(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { project_id, episode_id } = req.params
      const timeline = await timelineService.getTimeline(episode_id, project_id)
      res.json({ success: true, data: timeline })
    } catch (error) {
      logger.error('获取时间线失败', { error })
      res.status(500).json({ error: '获取时间线失败' })
    }
  }

  /**
   * @description 更新时间线轨道配置
   */
  async updateTracks(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { id } = req.params
      const { tracks } = req.body
      if (!tracks || !Array.isArray(tracks)) {
        res.status(400).json({ error: 'tracks 为必填数组' })
        return
      }
      const timeline = await timelineService.updateTimelineTracks(id, tracks)
      res.json({ success: true, data: timeline })
    } catch (error) {
      logger.error('更新时间线失败', { error })
      res.status(500).json({ error: '更新时间线失败' })
    }
  }

  /**
   * @description 发起合成渲染
   */
  async startRender(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { id } = req.params
      const result = await timelineService.startRender(id)
      res.json({ success: true, data: result })
    } catch (error) {
      logger.error('发起合成失败', { error })
      res.status(500).json({ error: '发起合成失败' })
    }
  }

  /**
   * @description 查询合成状态
   */
  async getRenderStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { id } = req.params
      const result = await timelineService.getRenderStatus(id)
      res.json({ success: true, data: result })
    } catch (error) {
      logger.error('查询合成状态失败', { error })
      res.status(500).json({ error: '查询合成状态失败' })
    }
  }
}

export const timelineController = new TimelineController()
