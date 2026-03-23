import { prisma } from '../lib/prisma'
import logger from '../lib/logger'
import crypto from 'crypto'
import { providerManager } from './ai/provider.manager'

/**
 * TTS 配音服务
 * 管理角色配音、旁白生成、批量合成
 */

interface SynthesizeOptions {
  text: string
  voice_id: string
  speed?: number
  emotion?: string
  provider_id: string
  project_id: string
  shot_id?: string
  episode_id?: string
  speaker?: string
}

interface BatchSynthesizeOptions {
  episode_id: string
  project_id: string
  provider_id: string
  default_voice_id?: string
}

async function ensureTTSProvider(provider_id: string) {
  const providerDb = await prisma.aIProvider.findUnique({ where: { id: provider_id } })
  if (!providerDb) {
    throw new Error(`Provider 不存在: ${provider_id}`)
  }

  // 确保 providerManager 已注册对应 provider 类型，避免 synthesizeSpeech 调用链路断裂
  providerManager.addProvider({
    id: providerDb.id,
    name: providerDb.type,
    type: providerDb.type,
    apiKey: providerDb.api_key,
    baseUrl: providerDb.base_url || undefined,
  })

  const provider = providerManager.getProvider(providerDb.id)
  if (!provider) {
    throw new Error(`Provider 注册失败: ${provider_id}`)
  }

  return provider
}

/**
 * @description 单条 TTS 合成
 */
export async function synthesizeSpeech(options: SynthesizeOptions) {
  const { text, voice_id, speed, emotion, provider_id, project_id, shot_id, episode_id, speaker } = options

  const provider = await ensureTTSProvider(provider_id)
  if (!provider.synthesizeSpeech) {
    throw new Error('该 Provider 不支持 TTS')
  }

  const result = await provider.synthesizeSpeech({
    text,
    voice_id,
    speed: speed || 1.0,
    emotion,
    format: 'mp3',
  })

  const now = new Date()
  const audioTrack = await prisma.audioTrack.create({
    data: {
      id: crypto.randomUUID(),
      project_id,
      shot_id: shot_id || null,
      episode_id: episode_id || null,
      type: speaker === 'narrator' ? 'narration' : 'dialogue',
      url: result.url,
      duration: result.duration,
      speaker: speaker || null,
      voice_id,
      emotion: emotion || null,
      text,
      volume: 1.0,
      status: 'completed',
      created_at: now,
      updated_at: now,
    },
  })

  if (shot_id) {
    await prisma.shot.update({
      where: { id: shot_id },
      data: {
        audio_url: result.url,
        audio_duration: result.duration,
      },
    })
  }

  logger.info('TTS 合成完成', { shot_id, speaker, duration: result.duration })

  return { audio_track: audioTrack, url: result.url, duration: result.duration }
}

/**
 * @description 批量为一集的所有 Shot 生成配音
 */
export async function batchSynthesizeForEpisode(options: BatchSynthesizeOptions) {
  const { episode_id, project_id, provider_id, default_voice_id } = options

  const shots = await prisma.shot.findMany({
    where: { episode_id, project_id },
    include: { Character: true },
    orderBy: [{ episode_number: 'asc' }, { segment_id: 'asc' }, { cell_id: 'asc' }],
  })

  const voiceProfiles = await prisma.voiceProfile.findMany({
    where: { project_id },
  })
  const voiceMap = new Map(voiceProfiles.map(v => [v.character_id, v]))

  const results: Array<{ shot_id: string; success: boolean; error?: string }> = []

  for (const shot of shots) {
    if (!shot.subtitle_text && !shot.action_summary) {
      results.push({ shot_id: shot.id, success: true })
      continue
    }

    const text = shot.subtitle_text || shot.action_summary
    const characterVoice = shot.character_id ? voiceMap.get(shot.character_id) : null
    const voice_id = characterVoice?.voice_id || default_voice_id

    if (!voice_id) {
      results.push({ shot_id: shot.id, success: false, error: '未配置声音' })
      continue
    }

    try {
      await synthesizeSpeech({
        text,
        voice_id,
        provider_id,
        project_id,
        shot_id: shot.id,
        episode_id,
        speaker: shot.Character?.name || 'narrator',
      })
      results.push({ shot_id: shot.id, success: true })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      logger.error('批量配音失败', { shot_id: shot.id, error: msg })
      results.push({ shot_id: shot.id, success: false, error: msg })
    }
  }

  return {
    total: shots.length,
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  }
}

/**
 * @description 获取可用声音列表
 */
export async function listVoices(provider_id: string) {
  const provider = await ensureTTSProvider(provider_id)
  if (!provider.listVoices) {
    throw new Error('该 Provider 不支持声音列表')
  }
  return provider.listVoices()
}

/**
 * @description 获取项目的声音配置
 */
export async function getProjectVoiceProfiles(project_id: string) {
  return prisma.voiceProfile.findMany({
    where: { project_id },
    orderBy: { created_at: 'desc' },
  })
}

/**
 * @description 创建/更新角色声音绑定
 */
export async function upsertVoiceProfile(data: {
  project_id: string
  character_id?: string
  name: string
  provider: string
  voice_id: string
  sample_url?: string
  language?: string
  gender?: string
  style?: string
}) {
  const existing = data.character_id
    ? await prisma.voiceProfile.findFirst({
        where: { project_id: data.project_id, character_id: data.character_id },
      })
    : null

  if (existing) {
    return prisma.voiceProfile.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        provider: data.provider,
        voice_id: data.voice_id,
        sample_url: data.sample_url,
        language: data.language || 'zh-CN',
        gender: data.gender,
        style: data.style,
      },
    })
  }

  return prisma.voiceProfile.create({
    data: {
      id: crypto.randomUUID(),
      project_id: data.project_id,
      character_id: data.character_id || null,
      name: data.name,
      provider: data.provider,
      voice_id: data.voice_id,
      sample_url: data.sample_url || null,
      language: data.language || 'zh-CN',
      gender: data.gender || null,
      style: data.style || null,
    },
  })
}
