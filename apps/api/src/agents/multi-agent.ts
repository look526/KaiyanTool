import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { providerManager } from '../services/ai/provider.manager';
import { getOrCreateDefaultEpisode } from '../utils/episode-resolver';
import { emitProgress, emitStreamChunk, emitTaskComplete, emitTaskError as _emitTaskError } from '../lib/websocket';
import { MULTI_AGENT_PROMPTS } from '../prompts/agents';

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any, context: AgentContext) => Promise<any>;
}

export interface AgentContext {
  projectId: string;
  taskId: string;
  userId: string;
  conversationHistory: AgentMessage[];
  data: Record<string, any>;
}

export interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  tools?: AgentTool[];
  maxIterations?: number;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected context: AgentContext;

  constructor(config: AgentConfig, context: AgentContext) {
    this.config = config;
    this.context = context;
  }

  async run(input: string, providerId: string): Promise<string> {
    const messages: AgentMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...this.context.conversationHistory,
      { role: 'user', content: input },
    ];

    let iteration = 0;
    const maxIterations = this.config.maxIterations || 10;

    while (iteration < maxIterations) {
      iteration++;

      const chatOptions: any = {};
      if (this.config.tools) {
        chatOptions.tools = this.formatTools(this.config.tools);
      }
      
      const provider = providerManager.getProvider(providerId);
      if (!provider) {
        throw new Error(`Provider not found: ${providerId}`);
      }
      
      const response = await provider.chat(messages, chatOptions);

      const assistantMessage = response.content;
      messages.push({ role: 'assistant', content: assistantMessage });

      const responseAny = response as any;
      if (responseAny.toolCalls && responseAny.toolCalls.length > 0) {
        for (const toolCall of responseAny.toolCalls) {
          const tool = this.config.tools?.find(t => t.name === toolCall.function.name);
          if (tool) {
            try {
              const params = JSON.parse(toolCall.function.arguments);
              const result = await tool.execute(params, this.context);

              messages.push({
                role: 'user',
                content: `Tool ${toolCall.function.name} result: ${JSON.stringify(result)}`,
              });

              emitProgress(
                this.context.projectId,
                this.context.taskId,
                iteration * 10,
                `执行工具: ${tool.name}`
              );
            } catch (error) {
              messages.push({
                role: 'user',
                content: `Tool ${toolCall.function.name} error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              });
            }
          }
        }
      } else {
        this.context.conversationHistory = messages.slice(1, -1);
        return assistantMessage;
      }
    }

    throw new Error('Max iterations reached');
  }

  protected formatTools(tools: AgentTool[]): any {
    return {
      type: 'function',
      functions: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      })),
    };
  }

  protected emitProgress(progress: number, message: string): void {
    emitProgress(this.context.projectId, this.context.taskId, progress, message);
  }

  protected emitStreamChunk(chunk: string, done: boolean = false): void {
    emitStreamChunk(this.context.projectId, this.context.taskId, chunk, done);
  }
}

export class StoryAgent extends BaseAgent {
  static create(context: AgentContext): StoryAgent {
    const tools: AgentTool[] = [
      {
        name: 'get_chapter',
        description: '获取小说章节内容',
        parameters: {
          type: 'object',
          properties: {
            chapterId: { type: 'string', description: '章节ID' },
          },
          required: ['chapterId'],
        },
        execute: async (params, ctx) => {
          const chapter = await prisma.novel.findFirst({
            where: { id: params.chapterId, project_id: ctx.projectId },
          });
          return chapter ? { content: chapter.content, title: chapter.title } : null;
        },
      },
      {
        name: 'get_outline',
        description: '获取大纲内容',
        parameters: {
          type: 'object',
          properties: {
            outlineId: { type: 'string', description: '大纲ID' },
          },
          required: ['outlineId'],
        },
        execute: async (params, ctx) => {
          const outline = await prisma.outline.findFirst({
            where: { id: params.outlineId, project_id: ctx.projectId },
          });
          return outline;
        },
      },
      {
        name: 'save_storyline',
        description: '保存故事线',
        parameters: {
          type: 'object',
          properties: {
            storyline: { type: 'object', description: '故事线内容' },
          },
          required: ['storyline'],
        },
        execute: async (params, ctx) => {
          const existing = await prisma.storyline.findFirst({
            where: { project_id: ctx.projectId } as any,
          });
          if (existing) {
            await prisma.storyline.update({
              where: { id: existing.id },
              data: { content: params.storyline } as any,
            });
          } else {
            await prisma.storyline.create({
              data: {
                project_id: ctx.projectId,
                content: params.storyline,
              } as any,
            });
          }
          return { success: true };
        },
      },
    ];

    return new StoryAgent(
      {
        name: '故事师',
        role: 'story',
        systemPrompt: MULTI_AGENT_PROMPTS.storyAgent.systemPrompt,
        tools,
        maxIterations: 15,
      },
      context
    );
  }
}

export class OutlineAgent extends BaseAgent {
  static create(context: AgentContext): OutlineAgent {
    const tools: AgentTool[] = [
      {
        name: 'get_storyline',
        description: '获取故事线',
        parameters: {
          type: 'object',
          properties: {},
        },
        execute: async (_params, ctx) => {
          const storyline = await prisma.storyline.findFirst({
            where: { project_id: ctx.projectId },
          });
          return storyline?.story;
        },
      },
      {
        name: 'get_characters',
        description: '获取角色列表',
        parameters: {
          type: 'object',
          properties: {},
        },
        execute: async (_params, ctx) => {
          const characters = await prisma.character.findMany({
            where: { project_id: ctx.projectId },
          });
          return characters;
        },
      },
      {
        name: 'save_outline',
        description: '保存大纲',
        parameters: {
          type: 'object',
          properties: {
            outline: { type: 'object', description: '大纲内容' },
          },
          required: ['outline'],
        },
        execute: async (params, ctx) => {
          const existingOutline = await prisma.outline.findFirst({
            where: { project_id: ctx.projectId } as any,
          });
          if (existingOutline) {
            await prisma.outline.update({
              where: { id: existingOutline.id },
              data: { content: params.outline } as any,
            });
          } else {
            await prisma.outline.create({
              data: {
                project_id: ctx.projectId,
                content: params.outline,
              } as any,
            });
          }
          return { success: true };
        },
      },
    ];

    return new OutlineAgent(
      {
        name: '大纲师',
        role: 'outline',
        systemPrompt: MULTI_AGENT_PROMPTS.outlineAgent.systemPrompt,
        tools,
        maxIterations: 20,
      },
      context
    );
  }
}

export class DirectorAgent extends BaseAgent {
  static create(context: AgentContext): DirectorAgent {
    const tools: AgentTool[] = [
      {
        name: 'get_storyline',
        description: '获取故事线',
        parameters: { type: 'object', properties: {} },
        execute: async (_params, ctx) => {
          const storyline = await prisma.storyline.findFirst({
            where: { project_id: ctx.projectId },
          });
          return storyline?.story;
        },
      },
      {
        name: 'get_outline',
        description: '获取大纲',
        parameters: { type: 'object', properties: {} },
        execute: async (_params, ctx) => {
          const outline = await prisma.outline.findFirst({
            where: { project_id: ctx.projectId },
          });
          return outline?.storyline_id;
        },
      },
      {
        name: 'update_storyline',
        description: '更新故事线',
        parameters: {
          type: 'object',
          properties: {
            storyline: { type: 'object' },
          },
          required: ['storyline'],
        },
        execute: async (params, ctx) => {
          await prisma.storyline.updateMany({
            where: { project_id: ctx.projectId } as any,
            data: { content: params.storyline } as any,
          });
          return { success: true };
        },
      },
      {
        name: 'update_outline',
        description: '更新大纲',
        parameters: {
          type: 'object',
          properties: {
            outline: { type: 'object' },
          },
          required: ['outline'],
        },
        execute: async (params, ctx) => {
          await prisma.outline.updateMany({
            where: { project_id: ctx.projectId } as any,
            data: { content: params.outline } as any,
          });
          return { success: true };
        },
      },
    ];

    return new DirectorAgent(
      {
        name: '导演',
        role: 'director',
        systemPrompt: MULTI_AGENT_PROMPTS.directorAgent.systemPrompt,
        tools,
        maxIterations: 25,
      },
      context
    );
  }
}

export class StoryboardAgent extends BaseAgent {
  static create(context: AgentContext): StoryboardAgent {
    const tools: AgentTool[] = [
      {
        name: 'get_outline',
        description: '获取大纲',
        parameters: { type: 'object', properties: {} },
        execute: async (_params, ctx) => {
          const outline = await prisma.outline.findFirst({
            where: { project_id: ctx.projectId },
          });
          return outline?.storyline_id;
        },
      },
      {
        name: 'get_characters',
        description: '获取角色信息',
        parameters: { type: 'object', properties: {} },
        execute: async (_params, ctx) => {
          return prisma.character.findMany({
            where: { project_id: ctx.projectId },
          });
        },
      },
      {
        name: 'get_scenes',
        description: '获取场景信息',
        parameters: { type: 'object', properties: {} },
        execute: async (_params, ctx) => {
          return prisma.scene.findMany({
            where: { project_id: ctx.projectId },
          });
        },
      },
      {
        name: 'create_shot',
        description: '创建分镜',
        parameters: {
          type: 'object',
          properties: {
            shot: { type: 'object', description: '分镜数据' },
          },
          required: ['shot'],
        },
        execute: async (params, ctx) => {
          const episode = await getOrCreateDefaultEpisode(ctx.projectId);
          const raw = (params.shot || {}) as Record<string, unknown>;
          const shot = await prisma.shot.create({
            data: {
              id: crypto.randomUUID(),
              project_id: ctx.projectId,
              episode_id: episode.id,
              scene_id: (raw.scene_id as string | null | undefined) ?? null,
              character_id: (raw.character_id as string | null | undefined) ?? null,
              action_summary: String(raw.action_summary ?? ''),
              camera_movement: (raw.camera_movement as string | null | undefined) ?? null,
              start_prompt: (raw.start_prompt as string | null | undefined) ?? null,
              end_prompt: (raw.end_prompt as string | null | undefined) ?? null,
              duration: typeof raw.duration === 'number' ? raw.duration : 8,
              aspect_ratio: typeof raw.aspect_ratio === 'string' ? raw.aspect_ratio : '16:9',
              updated_at: new Date(),
            },
          });
          return shot;
        },
      },
    ];

    return new StoryboardAgent(
      {
        name: '分镜师',
        role: 'storyboard',
        systemPrompt: MULTI_AGENT_PROMPTS.storyboardAgent.systemPrompt,
        tools,
        maxIterations: 30,
      },
      context
    );
  }
}

export class MultiAgentOrchestrator {
  private context: AgentContext;
  private agents: Map<string, BaseAgent> = new Map();
  private providerId: string;

  constructor(projectId: string, taskId: string, userId: string) {
    this.context = {
      projectId,
      taskId,
      userId,
      conversationHistory: [],
      data: {},
    };

    this.agents.set('story', StoryAgent.create(this.context));
    this.agents.set('outline', OutlineAgent.create(this.context));
    this.agents.set('director', DirectorAgent.create(this.context));
    this.agents.set('storyboard', StoryboardAgent.create(this.context));
    
    this.providerId = '';
  }

  async initialize(): Promise<void> {
    const aiProviders = await prisma.aIProvider.findMany({
      where: {
        enabled: true,
        User: {
          role: { in: ['admin', 'super_admin'] },
        },
      },
      include: { AIProviderModel: true },
    });

    if (aiProviders.length === 0) {
      throw new Error('没有可用的 AI 提供商');
    }

    const provider = aiProviders[0];
    this.providerId = provider.id;

    providerManager.addProvider({
      id: provider.id,
      name: provider.type,
      type: provider.type,
      apiKey: provider.api_key,
      baseUrl: provider.base_url || undefined,
    });
  }

  async runWorkflow(workflow: string[]): Promise<any> {
    await this.initialize();
    
    const results: Record<string, any> = {};

    for (let i = 0; i < workflow.length; i++) {
      const agentName = workflow[i];
      const agent = this.agents.get(agentName);

      if (!agent) {
        throw new Error(`Unknown agent: ${agentName}`);
      }

      emitProgress(
        this.context.projectId,
        this.context.taskId,
        (i / workflow.length) * 100,
        `${agentName} 正在工作...`
      );

      const input = this.prepareAgentInput(agentName, results);
      const result = await agent.run(input, this.providerId);
      results[agentName] = this.parseResult(result);
    }

    emitTaskComplete(this.context.projectId, this.context.taskId, results);
    return results;
  }

  private prepareAgentInput(agentName: string, previousResults: Record<string, any>): string {
    switch (agentName) {
      case 'story':
        return '请分析小说原文，生成故事线。';
      case 'outline':
        return `请根据以下故事线生成详细大纲：\n${JSON.stringify(previousResults.story, null, 2)}`;
      case 'director':
        return `请审核以下故事线和大纲：\n故事线：${JSON.stringify(previousResults.story, null, 2)}\n大纲：${JSON.stringify(previousResults.outline, null, 2)}`;
      case 'storyboard':
        return `请根据以下大纲生成分镜：\n${JSON.stringify(previousResults.outline, null, 2)}`;
      default:
        return '';
    }
  }

  private parseResult(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw: content };
    } catch {
      return { raw: content };
    }
  }

  async chat(agentName: string, message: string): Promise<string> {
    await this.initialize();
    
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Unknown agent: ${agentName}`);
    }
    return agent.run(message, this.providerId);
  }
}
