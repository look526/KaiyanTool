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

      logger.info('Seedream queryTask response', { 
        taskId, 
        status: data.status,
        progress: data.progress,
        hasResult: !!data.result,
        hasResultData: Array.isArray(data.result?.data),
        resultDataLength: data.result?.data?.length,
        hasData: !!data.data,
        hasMetadata: !!data.metadata,
        metadataOutputUrl: data.metadata?.output_url,
        dataUrl: data.url,
      });

      // 根据 API 文档，正确的 URL 提取逻辑
      let imageUrl = '';
      
      // 1. 优先从 result.data 数组获取（任务完成时的标准结构）
      if (data.result && data.result.data && Array.isArray(data.result.data) && data.result.data.length > 0) {
        imageUrl = data.result.data[0].url || '';
        logger.info('Seedream task: Found URL in result.data array', { url: imageUrl });
      }
      // 2. 从 data.data 数组获取（兼容旧版本或同步响应）
      else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        imageUrl = data.data[0].url || '';
        logger.info('Seedream task: Found URL in data.data array', { url: imageUrl });
      }
      // 3. 从 metadata.output_url 获取（兼容豆包特有参数）
      else if (data.metadata?.output_url) {
        imageUrl = data.metadata.output_url;
        logger.info('Seedream task: Found URL in metadata.output_url', { url: imageUrl });
      }
      // 4. 从 data.url 获取
      else if (data.url) {
        imageUrl = data.url;
        logger.info('Seedream task: Found URL in data.url', { url: imageUrl });
      }
      // 5. 从 metadata.image_url 获取
      else if (data.metadata?.image_url) {
        imageUrl = data.metadata.image_url;
        logger.info('Seedream task: Found URL in metadata.image_url', { url: imageUrl });
      }
      else {
        logger.warn('Seedream task: No URL found in response', { 
          taskId, 
          hasResult: !!data.result,
          hasData: !!data.data,
          hasMetadata: !!data.metadata,
        });
      }

      const task: SeedreamTask = {
        id: data.id,
        object: data.object || 'generation.task',
        model: data.model,
        status: data.status,
        progress: data.progress || 0,
        created_at: data.created_at || Date.now(),
        completed_at: data.completed_at,
        expires_at: data.expires_at,
        metadata: {
          width: data.metadata?.width || 0,
          height: data.metadata?.height || 0,
          resolution: data.metadata?.resolution || '2K',
          output_url: imageUrl, // 保存 output_url 到 metadata
        },
        url: imageUrl,
        result: data.result, // 保存完整的 result 对象
      }

      logger.info('Seedream constructed task', { taskId, taskUrl: task.url });

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
