import { prisma } from '../lib/prisma'
import logger from '../lib/logger'
import crypto from 'crypto'

/**
 * BGM/音效服务
 * 管理背景音乐生成、氛围匹配、音效推荐
 */

interface BGMGenerateOptions {
  project_id: string
  episode_id: string
  mood: string
  duration?: number
  provider_id?: string
}

/**
 * @description 根据氛围描述生成/推荐 BGM
 */
export async function generateBGM(options: BGMGenerateOptions) {
  const { project_id, episode_id, mood, duration = 60000 } = options

  // TODO: 接入 Suno API / 天工音乐 API 生成 BGM
  // 当前返回占位结果，后续接入实际 API
  logger.info('BGM 生成请求', { mood, duration, episode_id })

  const now = new Date()
  const audioTrack = await prisma.audioTrack.create({
    data: {
      id: crypto.randomUUID(),
      project_id,
      episode_id,
      type: 'bgm',
      url: '',
      duration,
      speaker: null,
      voice_id: null,
      emotion: mood,
      text: mood,
      start_time: 0,
      volume: 0.3,
      status: 'pending',
      created_at: now,
      updated_at: now,
    },
  })

  return audioTrack
}

/**
 * @description 上传自有 BGM
 */
export async function uploadBGM(data: {
  project_id: string
  episode_id?: string
  url: string
  duration: number
  name?: string
}) {
  const now = new Date()
  return prisma.audioTrack.create({
    data: {
      id: crypto.randomUUID(),
      project_id: data.project_id,
      episode_id: data.episode_id || null,
      type: 'bgm',
      url: data.url,
      duration: data.duration,
      speaker: data.name || 'BGM',
      volume: 0.3,
      status: 'completed',
      created_at: now,
      updated_at: now,
    },
  })
}

/**
 * @description 获取项目/集的 BGM 列表
 */
export async function listBGM(project_id: string, episode_id?: string) {
  return prisma.audioTrack.findMany({
    where: {
      project_id,
      type: 'bgm',
      ...(episode_id ? { episode_id } : {}),
    },
    orderBy: { created_at: 'desc' },
  })
}

/**
 * @description 删除 BGM
 */
export async function deleteBGM(id: string) {
  return prisma.audioTrack.delete({ where: { id } })
}

/**
 * @description 根据场景分析推荐氛围标签
 */
export function analyzeMood(sceneDescription: string): string[] {
  const moodKeywords: Record<string, string[]> = {
    '紧张悬疑': ['紧张', '悬疑', '追逐', '危险', '恐惧', '逃跑'],
    '温馨浪漫': ['温馨', '浪漫', '甜蜜', '约会', '相恋', '拥抱'],
    '悲伤忧郁': ['悲伤', '离别', '哭泣', '失去', '怀念', '伤心'],
    '激昂振奋': ['战斗', '胜利', '决心', '力量', '高潮', '爆发'],
    '平静舒缓': ['平静', '日常', '散步', '回忆', '安静', '思考'],
    '欢快活泼': ['欢乐', '庆祝', '搞笑', '派对', '游戏', '开心'],
    '神秘诡异': ['神秘', '黑暗', '阴森', '鬼', '夜晚', '迷雾'],
    '霸气威严': ['霸总', '权力', '商战', '威严', '总裁', '气场'],
  }

  const matched: string[] = []
  const lower = sceneDescription.toLowerCase()
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matched.push(mood)
    }
  }

  return matched.length > 0 ? matched : ['平静舒缓']
}
