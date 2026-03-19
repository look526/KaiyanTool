import { prisma } from '../lib/prisma'
import logger from '../lib/logger'
import crypto from 'crypto'

/**
 * 时间线合成服务
 * 管理时间线项目的创建、轨道配置、FFmpeg 合成
 */

interface TrackItem {
  id: string
  type: 'video' | 'audio' | 'bgm' | 'subtitle'
  source_url: string
  start_time: number
  duration: number
  volume?: number
  fade_in?: number
  fade_out?: number
  metadata?: Record<string, any>
}

interface Track {
  id: string
  type: 'video' | 'dialogue' | 'bgm' | 'sfx' | 'subtitle'
  name: string
  items: TrackItem[]
  muted: boolean
  volume: number
}

/**
 * @description 为一集自动创建时间线项目，加载所有素材到轨道
 */
export async function createTimelineForEpisode(episode_id: string, project_id: string) {
  const shots = await prisma.shot.findMany({
    where: { episode_id, project_id },
    include: { Character: true },
    orderBy: [{ episode_number: 'asc' }, { segment_id: 'asc' }, { cell_id: 'asc' }],
  })

  const audioTracks = await prisma.audioTrack.findMany({
    where: { episode_id, project_id },
    orderBy: { created_at: 'asc' },
  })

  const subtitle = await prisma.subtitle.findFirst({
    where: { episode_id, project_id },
  })

  const videoTrack: Track = { id: crypto.randomUUID(), type: 'video', name: '视频轨', items: [], muted: false, volume: 1.0 }
  const dialogueTrack: Track = { id: crypto.randomUUID(), type: 'dialogue', name: '配音轨', items: [], muted: false, volume: 1.0 }
  const bgmTrack: Track = { id: crypto.randomUUID(), type: 'bgm', name: 'BGM 轨', items: [], muted: false, volume: 0.3 }
  const subtitleTrack: Track = { id: crypto.randomUUID(), type: 'subtitle', name: '字幕轨', items: [], muted: false, volume: 1.0 }

  let currentTime = 0

  for (const shot of shots) {
    const videoDuration = shot.audio_duration || (shot.duration * 1000)

    if (shot.video_url || shot.lip_sync_url) {
      videoTrack.items.push({
        id: crypto.randomUUID(),
        type: 'video',
        source_url: shot.lip_sync_url || shot.video_url || '',
        start_time: currentTime,
        duration: videoDuration,
        metadata: { shot_id: shot.id, action: shot.action_summary },
      })
    }

    if (shot.audio_url) {
      dialogueTrack.items.push({
        id: crypto.randomUUID(),
        type: 'audio',
        source_url: shot.audio_url,
        start_time: currentTime,
        duration: shot.audio_duration || videoDuration,
        metadata: { shot_id: shot.id, speaker: shot.Character?.name },
      })
    }

    currentTime += videoDuration + 200
  }

  for (const at of audioTracks.filter(a => a.type === 'bgm')) {
    bgmTrack.items.push({
      id: crypto.randomUUID(),
      type: 'bgm',
      source_url: at.url,
      start_time: at.start_time || 0,
      duration: at.duration,
      volume: at.volume,
    })
  }

  if (subtitle) {
    const entries = subtitle.entries as any[]
    for (const entry of entries) {
      subtitleTrack.items.push({
        id: crypto.randomUUID(),
        type: 'subtitle',
        source_url: '',
        start_time: entry.start_time,
        duration: entry.end_time - entry.start_time,
        metadata: { text: entry.text, speaker: entry.speaker },
      })
    }
  }

  const tracks = [videoTrack, dialogueTrack, bgmTrack, subtitleTrack]
  const totalDuration = currentTime

  const existing = await prisma.timelineProject.findFirst({
    where: { episode_id, project_id },
  })

  const now = new Date()
  if (existing) {
    return prisma.timelineProject.update({
      where: { id: existing.id },
      data: { tracks: tracks as any, duration: totalDuration, updated_at: now },
    })
  }

  return prisma.timelineProject.create({
    data: {
      id: crypto.randomUUID(),
      project_id,
      episode_id,
      tracks: tracks as any,
      duration: totalDuration,
      fps: 30,
      resolution: '1080x1920',
      status: 'draft',
      created_at: now,
      updated_at: now,
    },
  })
}

/**
 * @description 获取时间线项目
 */
export async function getTimeline(episode_id: string, project_id: string) {
  return prisma.timelineProject.findFirst({ where: { episode_id, project_id } })
}

/**
 * @description 更新时间线轨道
 */
export async function updateTimelineTracks(timeline_id: string, tracks: Track[]) {
  const maxEnd = tracks.flatMap(t => t.items).reduce((max, item) => {
    return Math.max(max, item.start_time + item.duration)
  }, 0)

  return prisma.timelineProject.update({
    where: { id: timeline_id },
    data: { tracks: tracks as any, duration: maxEnd, updated_at: new Date() },
  })
}

/**
 * @description 发起 FFmpeg 合成任务
 */
export async function startRender(timeline_id: string) {
  const timeline = await prisma.timelineProject.findUnique({ where: { id: timeline_id } })
  if (!timeline) throw new Error('时间线不存在')

  await prisma.timelineProject.update({
    where: { id: timeline_id },
    data: { status: 'rendering', updated_at: new Date() },
  })

  logger.info('时间线合成任务已创建', { timeline_id })

  // TODO: 集成 Bull Queue + FFmpeg Worker 实现异步合成
  // 当前返回任务状态，后续实现实际合成逻辑
  return { timeline_id, status: 'rendering' }
}

/**
 * @description 获取合成状态
 */
export async function getRenderStatus(timeline_id: string) {
  const timeline = await prisma.timelineProject.findUnique({ where: { id: timeline_id } })
  if (!timeline) throw new Error('时间线不存在')
  return {
    timeline_id,
    status: timeline.status,
    output_url: timeline.output_url,
  }
}
