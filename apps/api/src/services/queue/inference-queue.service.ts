import Queue from 'bull'
import type { Job, JobOptions } from 'bull'
import logger from '../../lib/logger'

export interface InferenceTask {
  id?: string
  type: 'shot_generation' | 'image_generation' | 'video_generation' | 'prompt_optimization'
  userId: string
  projectId?: string
  payload: any
  priority?: number
  retryCount?: number
}

export interface TaskStatus {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  result?: any
  error?: string
  createdAt: Date
  updatedAt: Date
}

export class InferenceQueueService {
  private shotQueue: any
  private imageQueue: any
  private videoQueue: any
  private optimizationQueue: any

  constructor() {
    const queueConfig = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379') || 6379
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }
    this.shotQueue = new Queue('shot-generation', queueConfig)
    this.imageQueue = new Queue('image-generation', queueConfig)
    this.videoQueue = new Queue('video-generation', queueConfig)
    this.optimizationQueue = new Queue('prompt-optimization', queueConfig)

    this.setupEventHandlers()
  }
  private setupEventHandlers(): void {
    const setupQueueHandlers = (queue: any, name: string) => {
      queue.on('error', (err: any) => {
        logger.error(`${name}队列错误`, { error: err })
      })

      queue.on('waiting', (jobId: any) => {
        logger.debug(`${name}任务等待中`, { jobId })
      })

      queue.on('active', (job: any) => {
        logger.info(`${name}任务开始处理`, { jobId: job.id })
      })

      queue.on('completed', (job: any, result: any) => {
        logger.info(`${name}任务完成`, { jobId: job.id, result })
      })

      queue.on('failed', (job: any, err: any) => {
        logger.error(`${name}任务失败`, { jobId: job.id, error: err.message })
      })
    }

    setupQueueHandlers(this.shotQueue, '分镜生成')
    setupQueueHandlers(this.imageQueue, '图像生成')
    setupQueueHandlers(this.videoQueue, '视频生成')
    setupQueueHandlers(this.optimizationQueue, '提示词优化')
  }

  async addShotGenerationTask(
    userId: string,
    projectId: string,
    scriptContent: string,
    visualStyle?: string,
    options?: JobOptions
  ): Promise<Job> {
    return this.shotQueue.add(
      'shot-generation',
      {
        type: 'shot_generation',
        userId,
        projectId,
        payload: { scriptContent, visualStyle },
      },
      {
        ...options,
        priority: 1,
      }
    )
  }

  async addImageGenerationTask(
    userId: string,
    shotId: string,
    promptType: 'start' | 'end' | 'both',
    providerId: string,
    options?: JobOptions
  ): Promise<Job> {
    return this.imageQueue.add(
      `image-generation-${shotId}`,
      {
        type: 'image_generation',
        userId,
        payload: { shotId, promptType, providerId },
      },
      {
        ...options,
        priority: 2,
      }
    )
  }

  async addVideoGenerationTask(
    userId: string,
    shotId: string,
    providerId: string,
    options?: JobOptions
  ): Promise<Job> {
    return this.videoQueue.add(
      `video-generation-${shotId}`,
      {
        type: 'video_generation',
        userId,
        payload: { shotId, providerId },
      },
      {
        ...options,
        priority: 3,
      }
    )
  }

  async addPromptOptimizationTask(
    userId: string,
    shotId: string,
    referenceImages: string[],
    options?: JobOptions
  ): Promise<Job> {
    return this.optimizationQueue.add(
      `prompt-optimization-${shotId}`,
      {
        type: 'prompt_optimization',
        userId,
        payload: { shotId, referenceImages },
      },
      {
        ...options,
        priority: 1,
      }
    )
  }

  async addBatchImageGenerationTasks(
    userId: string,
    tasks: Array<{ shotId: string; promptType: 'start' | 'end' | 'both'; providerId: string }>,
    options?: JobOptions
  ): Promise<Job[]> {
    return Promise.all(
      tasks.map((task) =>
        this.addImageGenerationTask(
          userId,
          task.shotId,
          task.promptType,
          task.providerId,
          options
        )
      )
    )
  }

  async getTaskStatus(jobId: string, queueType: InferenceTask['type']): Promise<TaskStatus | null> {
    try {
      let queue: any

      switch (queueType) {
        case 'shot_generation':
          queue = this.shotQueue
          break
        case 'image_generation':
          queue = this.imageQueue
          break
        case 'video_generation':
          queue = this.videoQueue
          break
        case 'prompt_optimization':
          queue = this.optimizationQueue
          break
        default:
          throw new Error(`Unknown queue type: ${queueType}`)
      }

      const job = await queue.getJob(jobId)
      if (!job) {
        return null
      }

      return {
        id: job.id.toString(),
        status: this.getStatus(job),
        progress: job.progress() as number,
        result: job.returnvalue,
        error: job.failedReason,
        createdAt: new Date(job.timestamp),
        updatedAt: new Date(job.processedOn || job.timestamp),
      }
    } catch (error) {
      logger.error('获取任务状态失败', { jobId, queueType, error })
      return null
    }
  }

  async getQueueStats(queueType: InferenceTask['type']): Promise<{
    waiting: number
    active: number
    completed: number
    failed: number
  }> {
    try {
      let queue: any

      switch (queueType) {
        case 'shot_generation':
          queue = this.shotQueue
          break
        case 'image_generation':
          queue = this.imageQueue
          break
        case 'video_generation':
          queue = this.videoQueue
          break
        case 'prompt_optimization':
          queue = this.optimizationQueue
          break
        default:
          throw new Error(`Unknown queue type: ${queueType}`)
      }

      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ])

      return { waiting, active, completed, failed }
    } catch (error) {
      logger.error('获取队列统计失败', { queueType, error })
      return { waiting: 0, active: 0, completed: 0, failed: 0 }
    }
  }

  async clearQueue(queueType: InferenceTask['type']): Promise<void> {
    try {
      let queue: any

      switch (queueType) {
        case 'shot_generation':
          queue = this.shotQueue
          break
        case 'image_generation':
          queue = this.imageQueue
          break
        case 'video_generation':
          queue = this.videoQueue
          break
        case 'prompt_optimization':
          queue = this.optimizationQueue
          break
        default:
          throw new Error(`Unknown queue type: ${queueType}`)
      }

      await queue.obliterate()
      logger.info('队列已清空', { queueType })
    } catch (error) {
      logger.error('清空队列失败', { queueType, error })
    }
  }

  async pauseQueue(queueType: InferenceTask['type']): Promise<void> {
    try {
      let queue: any

      switch (queueType) {
        case 'shot_generation':
          queue = this.shotQueue
          break
        case 'image_generation':
          queue = this.imageQueue
          break
        case 'video_generation':
          queue = this.videoQueue
          break
        case 'prompt_optimization':
          queue = this.optimizationQueue
          break
        default:
          throw new Error(`Unknown queue type: ${queueType}`)
      }

      await queue.pause()
      logger.info('队列已暂停', { queueType })
    } catch (error) {
      logger.error('暂停队列失败', { queueType, error })
    }
  }

  async resumeQueue(queueType: InferenceTask['type']): Promise<void> {
    try {
      let queue: any

      switch (queueType) {
        case 'shot_generation':
          queue = this.shotQueue
          break
        case 'image_generation':
          queue = this.imageQueue
          break
        case 'video_generation':
          queue = this.videoQueue
          break
        case 'prompt_optimization':
          queue = this.optimizationQueue
          break
        default:
          throw new Error(`Unknown queue type: ${queueType}`)
      }

      await queue.resume()
      logger.info('队列已恢复', { queueType })
    } catch (error) {
      logger.error('恢复队列失败', { queueType, error })
    }
  }

  async shutdown(): Promise<void> {
    try {
      await Promise.all([
        this.shotQueue.close(),
        this.imageQueue.close(),
        this.videoQueue.close(),
        this.optimizationQueue.close(),
      ])
      logger.info('队列服务已关闭')
    } catch (error) {
      logger.error('关闭队列服务失败', { error })
    }
  }

  private getStatus(job: Job): TaskStatus['status'] {
    if (job.failedReason) {
      return 'failed'
    }
    if (job.returnvalue !== undefined) {
      return 'completed'
    }
    if (job.processedOn) {
      return 'processing'
    }
    return 'pending'
  }
}

export const inferenceQueueService = new InferenceQueueService()
