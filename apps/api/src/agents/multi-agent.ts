import { prisma } from '../lib/prisma';
import { aiProviderService } from '../services/ai/provider.service';
import { emitProgress, emitStreamChunk, emitTaskComplete, emitTaskError as _emitTaskError } from '../lib/websocket';

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

  async run(input: string): Promise<string> {
    const messages: AgentMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...this.context.conversationHistory,
      { role: 'user', content: input },
    ];

    let iteration = 0;
    const maxIterations = this.config.maxIterations || 10;

    while (iteration < maxIterations) {
      iteration++;

      const response = await aiProviderService.chat(
        'default',
        messages,
        this.config.tools ? this.formatTools(this.config.tools) : undefined
      );

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
            where: { id: params.chapterId, projectId: ctx.projectId },
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
            where: { id: params.outlineId, projectId: ctx.projectId },
          });
          return outline?.content;
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
            where: { projectId: ctx.projectId } as any,
          });
          if (existing) {
            await prisma.storyline.update({
              where: { id: existing.id },
              data: { content: params.storyline } as any,
            });
          } else {
            await prisma.storyline.create({
              data: {
                projectId: ctx.projectId,
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
        systemPrompt: `你是一个专业的故事师AI助手。你的专长是：
1. 分析小说原文，提取核心故事线
2. 识别主要角色和关键事件
3. 构建故事的起承转合结构
4. 确保故事逻辑连贯

你需要使用提供的工具来获取章节内容和大纲，然后生成结构化的故事线。

返回格式：
{
  "title": "故事标题",
  "summary": "故事概要",
  "episodes": [
    {
      "episodeIndex": 1,
      "title": "第X集标题",
      "summary": "本集概要",
      "keyEvents": ["事件1", "事件2"],
      "emotionalArc": "情绪曲线描述"
    }
  ],
  "characters": [
    {
      "name": "角色名",
      "role": "主角/配角",
      "description": "角色描述"
    }
  ]
}`,
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
            where: { projectId: ctx.projectId },
          });
          return storyline?.content;
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
            where: { projectId: ctx.projectId },
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
            where: { projectId: ctx.projectId } as any,
          });
          if (existingOutline) {
            await prisma.outline.update({
              where: { id: existingOutline.id },
              data: { content: params.outline } as any,
            });
          } else {
            await prisma.outline.create({
              data: {
                projectId: ctx.projectId,
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
        systemPrompt: `你是一个专业的大纲师AI助手。你的专长是：
1. 根据故事线生成详细的剧集大纲
2. 设计每集的核心矛盾和情感曲线
3. 规划视觉重点和经典台词
4. 提取场景、角色、道具需求

你需要使用提供的工具来获取故事线和角色信息，然后生成详细的大纲。

返回格式：
{
  "episodes": [
    {
      "episodeIndex": 1,
      "title": "第X集标题",
      "chapterRange": [1, 5],
      "coreConflict": "核心矛盾描述",
      "outline": "剧情主干",
      "openingHook": "开场镜头设计",
      "keyEvents": {
        "起": "开场事件",
        "承": "发展事件",
        "转": "转折事件",
        "合": "结局事件"
      },
      "emotionalCurve": "情绪曲线",
      "visualHighlights": ["视觉重点1", "视觉重点2"],
      "endingHook": "结尾悬念",
      "classicQuotes": ["经典台词1", "经典台词2"],
      "scenes": [
        { "name": "场景名", "description": "场景描述" }
      ],
      "characters": [
        { "name": "角色名", "role": "本集作用" }
      ],
      "props": [
        { "name": "道具名", "description": "道具描述" }
      ]
    }
  ]
}`,
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
            where: { projectId: ctx.projectId },
          });
          return storyline?.content;
        },
      },
      {
        name: 'get_outline',
        description: '获取大纲',
        parameters: { type: 'object', properties: {} },
        execute: async (_params, ctx) => {
          const outline = await prisma.outline.findFirst({
            where: { projectId: ctx.projectId },
          });
          return outline?.content;
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
            where: { projectId: ctx.projectId } as any,
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
            where: { projectId: ctx.projectId } as any,
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
        systemPrompt: `你是一个专业的导演AI助手。你的专长是：
1. 审核故事线和大纲的合理性
2. 提出修改建议和优化方案
3. 确保整体风格一致性
4. 平衡商业性和艺术性

你需要：
1. 审查故事线是否逻辑连贯
2. 检查大纲是否节奏合理
3. 提出具体的修改建议
4. 确认最终版本

返回格式：
{
  "review": {
    "storyline": {
      "score": 8,
      "issues": ["问题1", "问题2"],
      "suggestions": ["建议1", "建议2"]
    },
    "outline": {
      "score": 7,
      "issues": ["问题1"],
      "suggestions": ["建议1"]
    }
  },
  "approved": false,
  "finalAdjustments": {
    "storyline": { /* 调整内容 */ },
    "outline": { /* 调整内容 */ }
  }
}`,
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
            where: { projectId: ctx.projectId },
          });
          return outline?.content;
        },
      },
      {
        name: 'get_characters',
        description: '获取角色信息',
        parameters: { type: 'object', properties: {} },
        execute: async (_params, ctx) => {
          return prisma.character.findMany({
            where: { projectId: ctx.projectId },
          });
        },
      },
      {
        name: 'get_scenes',
        description: '获取场景信息',
        parameters: { type: 'object', properties: {} },
        execute: async (_params, ctx) => {
          return prisma.scene.findMany({
            where: { projectId: ctx.projectId },
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
          const shot = await prisma.shot.create({
            data: {
              projectId: ctx.projectId,
              ...params.shot,
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
        systemPrompt: `你是一个专业的分镜师AI助手。你的专长是：
1. 将大纲转化为详细的分镜脚本
2. 设计镜头语言和运镜方式
3. 编写视觉提示词
4. 规划时长和节奏

你需要使用提供的工具来获取大纲、角色和场景信息，然后生成分镜。

返回格式：
{
  "shots": [
    {
      "sequence": 1,
      "type": "wide/medium/closeup",
      "description": "镜头描述",
      "prompt": "AI图像生成提示词",
      "negativePrompt": "负面提示词",
      "duration": 3,
      "camera": {
        "movement": "推/拉/摇/移/跟/固定",
        "angle": "水平/俯视/仰视",
        "distance": "远景/全景/中景/近景/特写"
      },
      "dialogue": "台词",
      "action": "动作描述",
      "notes": "备注"
    }
  ],
  "totalDuration": 120,
  "styleGuide": {
    "visualStyle": "视觉风格",
    "colorPalette": ["主色调"],
    "lighting": "光线风格",
    "mood": "整体氛围"
  }
}`,
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
  }

  async runWorkflow(workflow: string[]): Promise<any> {
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
      const result = await agent.run(input);
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
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Unknown agent: ${agentName}`);
    }
    return agent.run(message);
  }
}
