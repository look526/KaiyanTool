import { Request, Response } from 'express'
import * as productionService from '../services/production-pipeline.service'
import logger from '../lib/logger'

class ProductionController {
  /**
   * @description 创建一键出片任务
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { project_id } = req.params
      const { episode_id, provider_id, tts_provider_id, default_voice_id, style, quality, skip_steps, enable_lip_sync } = req.body

      if (!episode_id || !provider_id) {
        res.status(400).json({ error: 'episode_id, provider_id 为必填' })
        return
      }

      const task = await productionService.createProductionTask({
        project_id, episode_id, provider_id, tts_provider_id,
        default_voice_id, style, quality, skip_steps, enable_lip_sync,
      })
      res.json({ success: true, data: task })
    } catch (error) {
      logger.error('创建 Production 任务失败', { error })
      res.status(500).json({ error: '创建任务失败' })
    }
  }

  /**
   * @description 执行 Pipeline
   */
  async execute(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { id } = req.params

      res.json({ success: true, data: { task_id: id, status: 'started' } })

      productionService.executeProductionTask(id).catch(err => {
        logger.error('Pipeline 执行异常', { task_id: id, error: err })
      })
    } catch (error) {
      logger.error('启动 Pipeline 失败', { error })
      res.status(500).json({ error: '启动 Pipeline 失败' })
    }
  }

  /**
   * @description 获取任务状态
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { id } = req.params
      const task = await productionService.getProductionTask(id)
      if (!task) { res.status(404).json({ error: '任务不存在' }); return }
      res.json({ success: true, data: task })
    } catch (error) {
      logger.error('获取任务状态失败', { error })
      res.status(500).json({ error: '获取任务状态失败' })
    }
  }

  /**
   * @description 获取项目的所有 Pipeline 任务
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { project_id } = req.params
      const tasks = await productionService.listProductionTasks(project_id)
      res.json({ success: true, data: tasks })
    } catch (error) {
      logger.error('获取任务列表失败', { error })
      res.status(500).json({ error: '获取任务列表失败' })
    }
  }

  /**
   * @description 取消任务
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { id } = req.params
      const task = await productionService.cancelProductionTask(id)
      res.json({ success: true, data: task })
    } catch (error) {
      logger.error('取消任务失败', { error })
      res.status(500).json({ error: '取消任务失败' })
    }
  }
}

export const productionController = new ProductionController()
