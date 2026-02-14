import { prisma } from '../lib/prisma';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  estimatedDuration: number;
  tags: string[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'manual' | 'ai' | 'approval';
  description: string;
  inputs: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
  }>;
  config?: Record<string, any>;
  nextSteps?: string[];
  parallel?: boolean;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  projectId: string;
  userId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStepId?: string;
  progress: number;
  data: Record<string, any>;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export class WorkflowService {
  private templates: Map<string, WorkflowTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const templates: WorkflowTemplate[] = [
      {
        id: 'novel-to-video',
        name: '小说转视频',
        description: '从导入小说到生成完整视频的完整工作流',
        category: 'content',
        estimatedDuration: 480,
        tags: ['小说', '视频', '完整流程'],
        steps: [
          {
            id: 'import',
            name: '导入小说',
            type: 'manual',
            description: '上传或粘贴小说内容',
            inputs: [{ name: 'content', type: 'text', required: true }],
            outputs: [{ name: 'novel', type: 'document' }],
            nextSteps: ['analyze']
          },
          {
            id: 'analyze',
            name: 'AI分析',
            type: 'ai',
            description: '使用AI分析小说结构',
            inputs: [{ name: 'novel', type: 'document', required: true }],
            outputs: [{ name: 'analysis', type: 'document' }],
            config: { model: 'gpt-4' },
            nextSteps: ['generate-characters', 'generate-scenes']
          },
          {
            id: 'generate-characters',
            name: '生成角色',
            type: 'ai',
            description: '生成角色定妆照',
            inputs: [{ name: 'analysis', type: 'document', required: true }],
            outputs: [{ name: 'characters', type: 'assets' }],
            config: { imageModel: 'midjourney' },
            nextSteps: ['approval-characters']
          },
          {
            id: 'approval-characters',
            name: '角色确认',
            type: 'approval',
            description: '审核生成的角色图像',
            inputs: [{ name: 'characters', type: 'assets', required: true }],
            outputs: [{ name: 'approvedCharacters', type: 'assets' }],
            nextSteps: ['generate-scenes']
          },
          {
            id: 'generate-scenes',
            name: '生成场景',
            type: 'ai',
            description: '生成场景概念图',
            inputs: [{ name: 'analysis', type: 'document', required: true }],
            outputs: [{ name: 'scenes', type: 'assets' }],
            config: { imageModel: 'stable-diffusion' },
            nextSteps: ['storyboard']
          },
          {
            id: 'storyboard',
            name: '分镜设计',
            type: 'ai',
            description: '生成视频分镜',
            inputs: [
              { name: 'scenes', type: 'assets', required: true },
              { name: 'duration', type: 'number', required: true, default: '30' }
            ],
            outputs: [{ name: 'storyboard', type: 'document' }],
            nextSteps: ['generate-keyframes']
          },
          {
            id: 'generate-keyframes',
            name: '生成关键帧',
            type: 'ai',
            description: '批量生成关键帧图像',
            inputs: [{ name: 'storyboard', type: 'document', required: true }],
            outputs: [{ name: 'keyframes', type: 'assets' }],
            config: { batchSize: 9 },
            nextSteps: ['generate-video']
          },
          {
            id: 'generate-video',
            name: '生成视频',
            type: 'ai',
            description: '从关键帧生成视频',
            inputs: [{ name: 'keyframes', type: 'assets', required: true }],
            outputs: [{ name: 'video', type: 'video' }],
            config: { videoModel: 'veo' },
            nextSteps: ['export']
          },
          {
            id: 'export',
            name: '导出成品',
            type: 'manual',
            description: '导出最终视频',
            inputs: [{ name: 'video', type: 'video', required: true }],
            outputs: [{ name: 'exportedVideo', type: 'file' }],
            parallel: false
          }
        ]
      },
      {
        id: 'quick-storyboard',
        name: '快速分镜',
        description: '从概念快速生成完整分镜',
        category: 'storyboard',
        estimatedDuration: 120,
        tags: ['分镜', '快速', '概念'],
        steps: [
          {
            id: 'concept',
            name: '输入概念',
            type: 'manual',
            description: '输入视频概念描述',
            inputs: [{ name: 'concept', type: 'text', required: true }],
            outputs: [{ name: 'conceptDoc', type: 'document' }],
            nextSteps: ['generate-storyboard']
          },
          {
            id: 'generate-storyboard',
            name: '生成分镜',
            type: 'ai',
            description: '使用AI生成分镜',
            inputs: [{ name: 'conceptDoc', type: 'document', required: true }],
            outputs: [{ name: 'storyboard', type: 'document' }],
            nextSteps: ['generate-keyframes']
          },
          {
            id: 'generate-keyframes',
            name: '生成关键帧',
            type: 'ai',
            description: '生成关键帧图像',
            inputs: [{ name: 'storyboard', type: 'document', required: true }],
            outputs: [{ name: 'keyframes', type: 'assets' }],
            nextSteps: ['export']
          },
          {
            id: 'export',
            name: '导出',
            type: 'manual',
            description: '导出关键帧',
            inputs: [{ name: 'keyframes', type: 'assets', required: true }],
            outputs: [{ name: 'export', type: 'file' }]
          }
        ]
      },
      {
        id: 'character-consistency',
        name: '角色一致性',
        description: '批量生成保持角色一致性的图像',
        category: 'character',
        estimatedDuration: 60,
        tags: ['角色', '一致性', '批量'],
        steps: [
          {
            id: 'base-look',
            name: '基础形象',
            type: 'manual',
            description: '上传或生成角色基础形象',
            inputs: [{ name: 'characterRef', type: 'image', required: true }],
            outputs: [{ name: 'baseLook', type: 'asset' }],
            nextSteps: ['generate-variants']
          },
          {
            id: 'generate-variants',
            name: '生成变体',
            type: 'ai',
            description: '生成角色在不同场景的变体',
            inputs: [
              { name: 'baseLook', type: 'asset', required: true },
              { name: 'variants', type: 'text', required: true }
            ],
            outputs: [{ name: 'variants', type: 'assets' }],
            nextSteps: ['batch-export']
          },
          {
            id: 'batch-export',
            name: '批量导出',
            type: 'manual',
            description: '批量导出角色图像',
            inputs: [{ name: 'variants', type: 'assets', required: true }],
            outputs: [{ name: 'export', type: 'file' }]
          }
        ]
      }
    ];

    templates.forEach(t => this.templates.set(t.id, t));
  }

  async getTemplates(options?: { category?: string; search?: string }) {
    let templates = Array.from(this.templates.values());

    if (options?.category) {
      templates = templates.filter(t => t.category === options.category);
    }

    if (options?.search) {
      const search = options.search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    return templates;
  }

  async getTemplate(id: string) {
    return this.templates.get(id) || null;
  }

  async createExecution(
    userId: string,
    projectId: string,
    templateId: string,
    initialData: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: templateId,
        projectId,
        userId,
        status: 'pending',
        progress: 0,
        data: initialData,
        metadata: {
          templateName: template.name,
          steps: template.steps.map(s => ({ id: s.id, name: s.name }))
        } as any
      }
    });

    return execution as any;
  }

  async startExecution(executionId: string) {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId }
    });

    if (!execution) {
      throw new Error('Execution not found');
    }

    const template = this.templates.get(execution.workflowId);
    if (!template) {
      throw new Error('Template not found');
    }

    const firstStep = template.steps[0];

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'running',
        currentStepId: firstStep.id,
        startedAt: new Date(),
        updatedAt: new Date()
      }
    });

    return this.executeStep(executionId, firstStep.id);
  }

  async executeStep(executionId: string, stepId: string) {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId }
    });

    if (!execution) {
      throw new Error('Execution not found');
    }

    const template = this.templates.get(execution.workflowId);
    if (!template) {
      throw new Error('Template not found');
    }

    const step = template.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    try {
      const stepProgress = 100 / template.steps.length;
      const currentProgress = template.steps.findIndex(s => s.id === stepId) * stepProgress;

      await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: 'running',
          currentStepId: stepId,
          progress: currentProgress,
          updatedAt: new Date()
        }
      });

      if (step.type === 'ai') {
        await this.processAIStep(execution, step);
      }

      if (step.nextSteps && step.nextSteps.length > 0 && !step.parallel) {
        const nextStepId = step.nextSteps[0];
        await this.executeStep(executionId, nextStepId);
      }

      const allStepsCompleted = template.steps.every(s => {
        const execStep = (execution.metadata as any)?.steps?.find((es: any) => es.id === s.id);
        return execStep?.completed;
      });

      if (allStepsCompleted || !step.nextSteps?.length) {
        await this.completeExecution(executionId);
      }

      return { success: true, step: stepId };
    } catch (error: any) {
      await this.failExecution(executionId, error.message);
      throw error;
    }
  }

  private async processAIStep(_execution: any, step: WorkflowStep) {
    console.log(`Processing AI step: ${step.name}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async pauseExecution(executionId: string) {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: 'paused', updatedAt: new Date() }
    });
  }

  async resumeExecution(executionId: string) {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId }
    });

    if (!execution) {
      throw new Error('Execution not found');
    }

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: 'running', updatedAt: new Date() }
    });

    if (execution.currentStepId) {
      await this.executeStep(executionId, execution.currentStepId);
    }
  }

  async cancelExecution(executionId: string) {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: 'cancelled', updatedAt: new Date() }
    });
  }

  private async completeExecution(executionId: string) {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  private async failExecution(executionId: string, error: string) {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        error,
        updatedAt: new Date()
      }
    });
  }

  async getExecution(executionId: string) {
    return prisma.workflowExecution.findUnique({
      where: { id: executionId }
    });
  }

  async getProjectExecutions(projectId: string) {
    return prisma.workflowExecution.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateExecutionData(executionId: string, data: Record<string, any>) {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        data: { ...(await prisma.workflowExecution.findUnique({ where: { id: executionId } }))?.data, ...data } as any,
        updatedAt: new Date()
      }
    });
  }
}

export const workflowService = new WorkflowService();
