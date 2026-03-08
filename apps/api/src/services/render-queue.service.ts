import { prisma } from '../lib/prisma';
import crypto from 'crypto';

interface TaskItem {
  id: string;
  type: 'image' | 'video' | 'video-interpolation';
  priority: number;
  params: any;
  project_id: string;
}

class RenderQueueService {
  private isProcessing = false;

  constructor(autoStart: boolean = true) {
    if (autoStart) {
      this.startProcessing();
    }
  }

  async addTask(
    type: TaskItem['type'],
    params: TaskItem['params'],
    project_id: string,
    priority: number = 5
  ): Promise<string> {
    const now = new Date();
    const task = await prisma.renderTask.create({
      data: {
        id: crypto.randomUUID(),
        type,
        status: 'pending',
        params,
        project_id: project_id,
        priority,
        progress: 0,
        created_at: now,
        updated_at: now
      }
    });

    return task.id;
  }

  async getQueueStatus(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    tasks: any[];
  }> {
    const [pending, processing, completed, failed] = await Promise.all([
      prisma.renderTask.count({ where: { status: 'pending' } }),
      prisma.renderTask.count({ where: { status: 'processing' } }),
      prisma.renderTask.count({ where: { status: 'completed' } }),
      prisma.renderTask.count({ where: { status: 'failed' } })
    ]);

    const tasks = await prisma.renderTask.findMany({
      where: {
        status: { in: ['pending', 'processing'] }
      },
      orderBy: [{ priority: 'desc' }, { created_at: 'asc' }],
      take: 50
    });

    return { pending, processing, completed, failed, tasks };
  }

  async pauseTask(taskId: string): Promise<void> {
    await prisma.renderTask.update({
      where: { id: taskId },
      data: { status: 'paused' }
    });
  }

  async resumeTask(taskId: string): Promise<void> {
    await prisma.renderTask.update({
      where: { id: taskId },
      data: { status: 'pending' }
    });
  }

  async cancelTask(taskId: string): Promise<void> {
    await prisma.renderTask.update({
      where: { id: taskId },
      data: { status: 'cancelled' }
    });
  }

  async retryTask(taskId: string): Promise<void> {
    await prisma.renderTask.update({
      where: { id: taskId },
      data: { status: 'pending', error: null }
    });
  }

  async getProjectQueue(project_id: string): Promise<any[]> {
    return prisma.renderTask.findMany({
      where: { project_id: project_id },
      orderBy: { created_at: 'desc' }
    });
  }

  private startProcessing(): void {
    setInterval(() => {
      this.processNextTask();
    }, 5000);
  }

  private async processNextTask(): Promise<void> {
    if (this.isProcessing) return;

    const task = await prisma.renderTask.findFirst({
      where: { status: 'pending' },
      orderBy: [{ priority: 'desc' }, { created_at: 'asc' }]
    });

    if (!task) return;

    this.isProcessing = true;

    try {
      await prisma.renderTask.update({
        where: { id: task.id },
        data: { status: 'processing', started_at: new Date() }
      });

      await this.executeTask(task);

      await prisma.renderTask.update({
        where: { id: task.id },
        data: {
          status: 'completed',
          completed_at: new Date(),
          progress: 100
        }
      });
    } catch (error) {
      await prisma.renderTask.update({
        where: { id: task.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeTask(task: any): Promise<void> {
    switch (task.type) {
      case 'image':
        await this.processImageTask(task);
        break;
      case 'video':
        await this.processVideoTask(task);
        break;
      case 'video-interpolation':
        await this.processInterpolationTask(task);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async processImageTask(task: any): Promise<void> {
    const { generateImage } = await import('./image-generation.service');

    await generateImage({
      prompt: task.params.prompt,
      width: task.params.width,
      height: task.params.height,
      size: task.params.size,
      resolution: task.params.resolution,
      n: task.params.n || 1,
      image_urls: task.params.image_urls,
      style: task.params.style,
      project_id: task.project_id
    });
  }

  private async processVideoTask(task: any): Promise<void> {
    const { generateVideo } = await import('./video-generation.service');

    await generateVideo({
      start_frame_id: task.params.start_frame_id,
      end_frame_id: task.params.end_frame_id,
      prompt: task.params.prompt,
      duration: task.params.duration,
      project_id: task.project_id,
      shot_id: task.params.shot_id
    });
  }

  private async processInterpolationTask(task: any): Promise<void> {
    const { interpolateFrames } = await import('./video-generation.service');

    await interpolateFrames(
      task.params.start_frame_id,
      task.params.end_frame_id,
      task.project_id
    );
  }

  async updateProgress(taskId: string, progress: number): Promise<void> {
    await prisma.renderTask.update({
      where: { id: taskId },
      data: { progress }
    });
  }

  async addLog(taskId: string, message: string): Promise<void> {
    const task = await prisma.renderTask.findUnique({
      where: { id: taskId }
    });

    if (!task) return;

    const logs = (task.logs as any[]) || [];
    logs.push({
      timestamp: new Date().toISOString(),
      message
    });

    await prisma.renderTask.update({
      where: { id: taskId },
      data: { logs }
    });
  }
}

export const renderQueueService = new RenderQueueService(false);
