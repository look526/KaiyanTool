import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import * as ttsService from '../services/tts.service'
import logger from '../lib/logger'

class TTSController {
  /**
   * @description 单条 TTS 合成
   */
  async synthesize(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }

      const { project_id } = req.params
      const { text, voice_id, speed, emotion, provider_id, shot_id, episode_id, speaker } = req.body

      if (!text || !voice_id || !provider_id) {
        res.status(400).json({ error: 'text, voice_id, provider_id 为必填' })
        return
      }

      const project = await prisma.project.findFirst({
        where: { id: project_id, OR: [{ owner_id: req.user_id }, { ProjectMember: { some: { user_id: req.user_id } } }] },
      })
      if (!project) { res.status(404).json({ error: 'Project not found' }); return }

      const result = await ttsService.synthesizeSpeech({
        text, voice_id, speed, emotion, provider_id,
        project_id, shot_id, episode_id, speaker,
      })

      res.json({ success: true, data: result })
    } catch (error) {
      logger.error('TTS 合成失败', { error })
      res.status(500).json({ error: 'TTS 合成失败' })
    }
  }

  /**
   * @description 批量为一集的 Shot 生成配音
   */
  async batchSynthesize(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }

      const { project_id } = req.params
      const { episode_id, provider_id, default_voice_id } = req.body

      if (!episode_id || !provider_id) {
        res.status(400).json({ error: 'episode_id, provider_id 为必填' })
        return
      }

      const project = await prisma.project.findFirst({
        where: { id: project_id, OR: [{ owner_id: req.user_id }, { ProjectMember: { some: { user_id: req.user_id } } }] },
      })
      if (!project) { res.status(404).json({ error: 'Project not found' }); return }

      const result = await ttsService.batchSynthesizeForEpisode({
        episode_id, project_id, provider_id, default_voice_id,
      })

      res.json({ success: true, data: result })
    } catch (error) {
      logger.error('批量配音失败', { error })
      res.status(500).json({ error: '批量配音失败' })
    }
  }

  /**
   * @description 获取可用声音列表
   */
  async listVoices(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }

      const { provider_id } = req.query
      if (!provider_id || typeof provider_id !== 'string') {
        res.status(400).json({ error: 'provider_id 为必填' })
        return
      }

      const voices = await ttsService.listVoices(provider_id)
      res.json({ success: true, data: voices })
    } catch (error) {
      logger.error('获取声音列表失败', { error })
      res.status(500).json({ error: '获取声音列表失败' })
    }
  }

  /**
   * @description 获取项目声音配置
   */
  async getVoiceProfiles(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { project_id } = req.params
      const profiles = await ttsService.getProjectVoiceProfiles(project_id)
      res.json({ success: true, data: profiles })
    } catch (error) {
      logger.error('获取声音配置失败', { error })
      res.status(500).json({ error: '获取声音配置失败' })
    }
  }

  /**
   * @description 创建/更新角色声音绑定
   */
  async upsertVoiceProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { project_id } = req.params
      const { character_id, name, provider, voice_id, sample_url, language, gender, style } = req.body

      if (!name || !provider || !voice_id) {
        res.status(400).json({ error: 'name, provider, voice_id 为必填' })
        return
      }

      const profile = await ttsService.upsertVoiceProfile({
        project_id, character_id, name, provider, voice_id,
        sample_url, language, gender, style,
      })
      res.json({ success: true, data: profile })
    } catch (error) {
      logger.error('声音配置更新失败', { error })
      res.status(500).json({ error: '声音配置更新失败' })
    }
  }

  /**
   * @description 删除声音配置
   */
  async deleteVoiceProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) { res.status(401).json({ error: 'Unauthorized' }); return }
      const { id } = req.params
      await prisma.voiceProfile.delete({ where: { id } })
      res.json({ success: true })
    } catch (error) {
      logger.error('删除声音配置失败', { error })
      res.status(500).json({ error: '删除声音配置失败' })
    }
  }
}

export const ttsController = new TTSController()
