import { TextSegment } from './intelligent-segmenter'

export interface ProcessingTask {
  id: string
  segment: TextSegment
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  error?: string
  retryCount: number
  startTime?: Date
  endTime?: Date
}

export class ParallelProcessor {
  /** 默认与 config.ai.largeText.maxConcurrency 一致；可由 configure 覆盖 */
  private maxConcurrency = 5
  private taskQueue: Map<string, ProcessingTask> = new Map()
  private activeTasks = new Set<string>()
  private maxRetries = 2

  setMaxConcurrency(concurrency: number) {
    this.maxConcurrency = concurrency
  }

  setMaxRetries(retries: number) {
    this.maxRetries = retries
  }

  async processSegments(
    segments: TextSegment[],
    processor: (segment: TextSegment) => Promise<any>
  ): Promise<Map<string, any>> {
    const results = new Map<string, any>()

    console.log(`[并行处理] 开始处理 ${segments.length} 个片段`)

    for (const segment of segments) {
      const task: ProcessingTask = {
        id: segment.id,
        segment,
        status: 'pending',
        retryCount: 0
      }
      this.taskQueue.set(segment.id, task)
      console.log(`[并行处理] 添加片段任务: ${segment.id}`)
    }

    await this.runProcessorLoop(processor, results)

    console.log(`[并行处理] 完成，成功 ${results.size}/${segments.length}`)

    return results
  }

  private async runProcessorLoop(
    processor: (segment: TextSegment) => Promise<any>,
    results: Map<string, any>
  ) {
    const pendingTasks = Array.from(this.taskQueue.values())
      .filter(t => t.status === 'pending')

    console.log(`[并行处理] 循环检查，待处理任务: ${pendingTasks.length}, 活动任务: ${this.activeTasks.size}, 最大并发: ${this.maxConcurrency}`)

    if (pendingTasks.length === 0) {
      console.log('[并行处理] 没有待处理任务，退出循环')
      return
    }

    const tasksToProcess = pendingTasks
      .slice(0, this.maxConcurrency - this.activeTasks.size)

    console.log(`[并行处理] 准备处理 ${tasksToProcess.length} 个任务`)

    const promises = tasksToProcess.map(task =>
      this.processTask(task, processor, results)
    )

    await Promise.all(promises)

    await this.runProcessorLoop(processor, results)
  }

  private async processTask(
    task: ProcessingTask,
    processor: (segment: TextSegment) => Promise<any>,
    results: Map<string, any>
  ) {
    this.activeTasks.add(task.id)
    task.status = 'processing'
    task.startTime = new Date()

    console.log(`[并行处理] 开始处理片段: ${task.id}, 内容长度: ${task.segment.content.length}`)

    try {
      const result = await processor(task.segment)
      task.result = result
      task.status = 'completed'
      task.endTime = new Date()
      results.set(task.id, result)
      console.log(`[并行处理] 片段 ${task.id} 处理成功，scenes: ${result.scenes?.length || 0}, characters: ${result.characters?.length || 0}`)
    } catch (error) {
      task.error = error instanceof Error ? error.message : String(error)
      task.retryCount++

      console.error(`[并行处理] 片段 ${task.id} 处理失败:`, error)

      if (task.retryCount < this.maxRetries) {
        task.status = 'pending'
        await new Promise(resolve => setTimeout(resolve, 1000 * task.retryCount))
      } else {
        task.status = 'failed'
        task.endTime = new Date()
      }
    } finally {
      this.activeTasks.delete(task.id)
    }
  }

  getTaskStatus(taskId: string): ProcessingTask | undefined {
    return this.taskQueue.get(taskId)
  }

  getAllTasks(): ProcessingTask[] {
    return Array.from(this.taskQueue.values())
  }
}
