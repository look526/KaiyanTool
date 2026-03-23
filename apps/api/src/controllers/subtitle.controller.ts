import { Request, Response } from 'express'
import * as subtitleService from '../services/subtitle.service'
import logger from '../lib/logger'

class SubtitleController {
  /**
   * @description 从 Shot 列表生成字幕
   */
  async generate(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { project_id, episode_id } = req.params
      const subtitle = await subtitleService.generateSubtitlesFromShots(episode_id, project_id)
      res.json({ success: true, data: subtitle })
    } catch (error) {
      logger.error('生成字幕失败', { error })
      res.status(500).json({ error: '生成字幕失败' })
    }
  }

  /**
   * @description 获取一集的字幕
   */
  async get(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { project_id, episode_id } = req.params
      const subtitle = await subtitleService.getSubtitle(episode_id, project_id)
      res.json({ success: true, data: subtitle })
    } catch (error) {
      logger.error('获取字幕失败', { error })
      res.status(500).json({ error: '获取字幕失败' })
    }
  }

  /**
   * @description 更新字幕条目
   */
  async updateEntries(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { id } = req.params
      const { entries } = req.body
      if (!entries || !Array.isArray(entries)) {
        res.status(400).json({ error: 'entries 为必填数组' })
        return
      }
      const subtitle = await subtitleService.updateSubtitleEntries(id, entries)
      res.json({ success: true, data: subtitle })
    } catch (error) {
      logger.error('更新字幕失败', { error })
      res.status(500).json({ error: '更新字幕失败' })
    }
  }

  /**
   * @description 更新字幕样式
   */
  async updateStyle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { id } = req.params
      const { style } = req.body
      const subtitle = await subtitleService.updateSubtitleStyle(id, style || {})
      res.json({ success: true, data: subtitle })
    } catch (error) {
      logger.error('更新字幕样式失败', { error })
      res.status(500).json({ error: '更新字幕样式失败' })
    }
  }

  /**
   * @description 导出字幕文件
   */
  async exportSubtitle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { id } = req.params
      const { format } = req.query

      const subtitle = await import('../lib/prisma').then(m => m.prisma.subtitle.findUnique({ where: { id } }))
      if (!subtitle) { res.status(404).json({ error: '字幕不存在' }); return }

      const entries = subtitle.entries as any[]
      const exportFormat = (((format as string) || (subtitle.format as string) || 'srt') as string).toLowerCase()

      let content: string
      let contentType: string
      let filename: string

      if (exportFormat === 'vtt') {
        content = subtitleService.exportToVTT(entries)
        contentType = 'text/vtt'
        filename = `subtitles_${id}.vtt`
      } else if (exportFormat === 'ass' || exportFormat === 'ssa') {
        content = subtitleService.exportToASS(entries)
        contentType = 'text/plain'
        filename = `subtitles_${id}.ass`
      } else {
        content = subtitleService.exportToSRT(entries)
        contentType = 'text/srt'
        filename = `subtitles_${id}.srt`
      }

      res.setHeader('Content-Type', contentType)
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(content)
    } catch (error) {
      logger.error('导出字幕失败', { error })
      res.status(500).json({ error: '导出字幕失败' })
    }
  }
}

export const subtitleController = new SubtitleController()
