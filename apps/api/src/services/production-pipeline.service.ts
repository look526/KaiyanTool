import { prisma } from '../lib/prisma'
import logger from '../lib/logger'
import crypto from 'crypto'

/**
 * 一键出片 Pipeline 服务
 * 编排端到端的自动化生产流程：大纲 → 分镜 → 图像 → 视频 → 配音 → 字幕 → 合成
 */

type PipelineStep =
  | 'generate_shots'
  | 'generate_images'
  | 'generate_videos'
  | 'generate_tts'
  | 'generate_bgm'
  | 'generate_subtitles'
  | 'generate_lip_sync'
  | 'compose_timeline'

const PIPELINE_STEPS: PipelineStep[] = [
  'generate_shots',
  'generate_images',
  'generate_videos',
  'generate_tts',
  'generate_bgm',
  'generate_subtitles',
  'generate_lip_sync',
  'compose_timeline',
]

const STEP_LABELS: Record<PipelineStep, string> = {
  generate_shots: '生成分镜',
  generate_images: '生成分镜图像',
  generate_videos: '生成视频',
  generate_tts: '生成配音',
  generate_bgm: '生成背景音乐',
  generate_subtitles: '生成字幕',
  generate_lip_sync: '口型同步',
  compose_timeline: '时间线合成',
}

interface PipelineConfig {
  project_id: string
  episode_id: string
  provider_id: string
  tts_provider_id?: string
  default_voice_id?: string
  style?: string
  quality?: string
  skip_steps?: PipelineStep[]
  enable_lip_sync?: boolean
}

/**
 * @description 创建 Pipeline 任务
 */
export async function createProductionTask(config: PipelineConfig) {
  const activeSteps = PIPELINE_STEPS.filter(s => {
    if (config.skip_steps?.includes(s)) return false
    if (s === 'generate_lip_sync' && !config.enable_lip_sync) return false
    return true
  })

  const now = new Date()
  const task = await prisma.productionTask.create({
    data: {
      id: crypto.randomUUID(),
      project_id: config.project_id,
      episode_id: config.episode_id,
      type: 'full_production',
      config: config as any,
      progress: 0,
      current_step: activeSteps[0],
      total_steps: activeSteps.length,
      status: 'pending',
      created_at: now,
      updated_at: now,
    },
  })

  logger.info('Production 任务已创建', { task_id: task.id, steps: activeSteps.length })
  return task
}

/**
 * @description 执行 Pipeline（当前为同步骨架，后续接入 Bull Queue）
 */
export async function executeProductionTask(task_id: string) {
  const task = await prisma.productionTask.findUnique({ where: { id: task_id } })
  if (!task) throw new Error('任务不存在')

  const config = task.config as unknown as PipelineConfig
  const activeSteps = PIPELINE_STEPS.filter(s => {
    if (config.skip_steps?.includes(s)) return false
    if (s === 'generate_lip_sync' && !config.enable_lip_sync) return false
    return true
  })

  await prisma.productionTask.update({
    where: { id: task_id },
    data: { status: 'processing', started_at: new Date(), updated_at: new Date() },
  })

  const errors: Array<{ step: string; error: string }> = []

  for (let i = 0; i < activeSteps.length; i++) {
    const step = activeSteps[i]
    const progress = ((i / activeSteps.length) * 100)

    await prisma.productionTask.update({
      where: { id: task_id },
      data: {
        current_step: STEP_LABELS[step],
        progress,
        updated_at: new Date(),
      },
    })

    logger.info(`Pipeline 执行步骤: ${STEP_LABELS[step]}`, { task_id, step, progress })

    try {
      await executeStep(step, config)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      errors.push({ step, error: msg })
      logger.error(`Pipeline 步骤失败: ${step}`, { task_id, error: msg })
    }
  }

  const finalStatus = errors.length === 0 ? 'completed' : 'completed'
  await prisma.productionTask.update({
    where: { id: task_id },
    data: {
      status: finalStatus,
      progress: 100,
      current_step: null,
      error_log: errors.length > 0 ? (errors as any) : null,
      completed_at: new Date(),
      updated_at: new Date(),
    },
  })

  logger.info('Pipeline 执行完成', { task_id, errors: errors.length })
  return { task_id, status: finalStatus, errors }
}

/**
 * @description 执行单个步骤（后续逐步实现各步骤的具体逻辑）
 */
async function executeStep(step: PipelineStep, config: PipelineConfig) {
  switch (step) {
    case 'generate_shots':
      logger.info('Pipeline: 生成分镜', { episode_id: config.episode_id })
      break

    case 'generate_images':
      logger.info('Pipeline: 生成分镜图像', { episode_id: config.episode_id })
      break

    case 'generate_videos':
      logger.info('Pipeline: 生成视频', { episode_id: config.episode_id })
      break

    case 'generate_tts': {
      if (!config.tts_provider_id) {
        logger.warn('Pipeline: 跳过 TTS（未配置 provider）')
        break
      }
      const ttsService = await import('./tts.service')
      await ttsService.batchSynthesizeForEpisode({
        episode_id: config.episode_id,
        project_id: config.project_id,
        provider_id: config.tts_provider_id,
        default_voice_id: config.default_voice_id,
      })
      break
    }

    case 'generate_bgm':
      logger.info('Pipeline: 生成 BGM', { episode_id: config.episode_id })
      break

    case 'generate_subtitles': {
      const subtitleService = await import('./subtitle.service')
      await subtitleService.generateSubtitlesFromShots(config.episode_id, config.project_id)
      break
    }

    case 'generate_lip_sync':
      logger.info('Pipeline: 口型同步', { episode_id: config.episode_id })
      break

    case 'compose_timeline': {
      const timelineService = await import('./timeline.service')
      await timelineService.createTimelineForEpisode(config.episode_id, config.project_id)
      break
    }
  }
}

/**
 * @description 获取 Pipeline 任务状态
 */
export async function getProductionTask(task_id: string) {
  return prisma.productionTask.findUnique({ where: { id: task_id } })
}

/**
 * @description 获取项目的所有 Pipeline 任务
 */
export async function listProductionTasks(project_id: string) {
  return prisma.productionTask.findMany({
    where: { project_id },
    orderBy: { created_at: 'desc' },
  })
}

/**
 * @description 取消 Pipeline 任务
 */
export async function cancelProductionTask(task_id: string) {
  return prisma.productionTask.update({
    where: { id: task_id },
    data: { status: 'failed', current_step: null, updated_at: new Date() },
  })
}
