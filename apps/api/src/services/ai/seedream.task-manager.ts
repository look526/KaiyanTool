import { SeedreamTask } from '../../types/seedream.types'
import logger from '../../lib/logger'

interface TaskOptions {
  pollInterval?: number
  maxPollAttempts?: number
  onProgress?: (task: SeedreamTask) => void
}

export class SeedreamTaskManager {
  private apiKey: string
  private baseUrl: string
  private defaultPollInterval = 2000
  private defaultMaxPollAttempts = 150

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async waitForTaskCompletion(
    taskId: string,
    options: TaskOptions = {}
  ): Promise<SeedreamTask> {
    const {
      pollInterval = this.defaultPollInterval,
      maxPollAttempts = this.defaultMaxPollAttempts,
      onProgress,
    } = options

    let attempts = 0

    logger.info('Waiting for Seedream task completion', {
      taskId,
      pollInterval,
      maxAttempts: maxPollAttempts,
    })

    while (attempts < maxPollAttempts) {
      const task = await this.queryTask(taskId)

      logger.debug('Seedream task status', {
        taskId,
        status: task.status,
        progress: task.progress,
        attempt: attempts,
      })

      onProgress?.(task)

      if (task.status === 'completed') {
        logger.info('Seedream task completed successfully', {
          taskId,
          attempts,
          duration: attempts * pollInterval,
        })
        return task
      }

      if (task.status === 'failed') {
        logger.error('Seedream task failed', {
          taskId,
          attempts,
          progress: task.progress,
        })
        return task
      }

      await this.sleep(pollInterval)
      attempts++
    }

    const error = `Task ${taskId} timeout after ${attempts} attempts (${attempts * pollInterval}ms)`
    logger.error('Seedream task timeout', { taskId, attempts, maxAttempts: maxPollAttempts })
    throw new Error(error)
  }

  private async queryTask(taskId: string): Promise<SeedreamTask> {
    const url = `${this.baseUrl}/images/generations/${taskId}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('Seedream query task failed', {
          taskId,
          status: response.status,
          error: errorText,
        })
        throw new Error(`Query task failed with status ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      const task: SeedreamTask = {
        id: data.id,
        object: data.object || 'generation.task',
        model: data.model,
        status: data.status,
        progress: data.progress || 0,
        created_at: data.created_at || Date.now(),
        metadata: data.metadata || {
          width: 0,
          height: 0,
          resolution: '2K',
        },
      }

      return task
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Seedream query task error', { taskId, error: error.message })
        throw error
      }
      logger.error('Seedream query task unknown error', { taskId, error: String(error) })
      throw new Error(`Query task failed: ${String(error)}`)
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
