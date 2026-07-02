import { prisma } from '../lib/prisma';
import logger from '../lib/logger';
import { STORYLINE_AGENT } from '../prompts/agents';
import { AIProviderHelper } from '../services/ai/provider-helper.service';
import { AIChatMessage } from '../types/ai.types';
import * as crypto from 'crypto';

interface StoryInput {
  title: string;
  genre: string;
  description: string;
  style?: string;
  targetDuration?: number;
  targetAudience?: string;
  tone?: 'dramatic' | 'comedy' | 'romance' | 'thriller' | 'action' | 'horror' | 'sci-fi';
}

interface StorylineOutput {
  title: string;
  logline: string;
  synopsis: string;
  themes: string[];
  structure: {
    act1: { title: string; beats: string[] };
    act2: { title: string; beats: string[] };
    act3: { title: string; beats: string[] };
  };
  characters: Array<{
    name: string;
    role: string;
    arc: string;
    description: string;
  }>;
  suggestedDuration: number;
  suggestedStyle: string;
}

export class StorylineAgent {
  constructor() {}

  private async chat(
    messages: AIChatMessage[],
    userId?: string,
    model?: string
  ) {
    const { aiProvider, modelName, providerId } = await AIProviderHelper.getProvider(userId, model, 'storyline');

    logger.debug('Provider selected for storyline agent', {
      providerId,
      modelName,
      userId,
    });

    return aiProvider.chat(messages, modelName ? { model: modelName } : undefined);
  }

  async generateStoryline(input: StoryInput, userId?: string, model?: string): Promise<StorylineOutput> {
    const systemPrompt = STORYLINE_AGENT.systemPrompt;

    const userPrompt = STORYLINE_AGENT.userPromptTemplate
      .replace('{{title}}', input.title)
      .replace('{{genre}}', input.genre)
      .replace('{{targetAudience}}', input.targetAudience || '大众')
      .replace('{{tone}}', input.tone || '平衡')
      .replace('{{style}}', input.style || '')
      .replace('{{targetDuration}}', String(input.targetDuration || 15))
      .replace('{{description}}', input.description);

    try {
      const response = await this.chat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        userId,
        model
      );

      const parsed = this.parseJsonResponse(response.content);
      return this.validateOutput(parsed);
    } catch (error) {
      logger.error('Storyline generation failed', { error });
      throw new Error('故事线生成失败');
    }
  }

  async refineStoryline(
    storylineId: string,
    feedback: string,
    userId?: string,
    model?: string
  ): Promise<StorylineOutput> {
    const existingStoryline = await prisma.document.findUnique({
      where: { id: storylineId }
    });

    if (!existingStoryline) {
      throw new Error('Storyline not found');
    }

    const content = existingStoryline.content as any;

    const systemPrompt = STORYLINE_AGENT.refinePrompt;

    const userPrompt = `请根据以下反馈优化故事线：

**原始故事线**
${JSON.stringify(content, null, 2)}

**用户反馈**
${feedback}

请返回优化后的完整故事线JSON：`;

    const response = await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      userId,
      model
    );

    const parsed = this.parseJsonResponse(response.content);
    return this.validateOutput(parsed);
  }

  async generateCharacterBackstory(
    characterName: string,
    role: string,
    storyContext: string,
    userId?: string,
    model?: string
  ): Promise<{
    backstory: string;
    motivations: string[];
    flaws: string[];
    goals: string[];
    relationships: Array<{ name: string; relation: string; dynamic: string }>;
  }> {
    const prompt = `为以下角色生成详细背景：

角色名：${characterName}
身份：${role}
故事背景：${storyContext}

请返回JSON：
{
  "backstory": "详细背景故事",
  "motivations": ["动机1", "动机2"],
  "flaws": ["缺陷1", "缺陷2"],
  "goals": ["目标1", "目标2"],
  "relationships": [
    {"name": "相关角色名", "relation": "关系", "dynamic": "关系动态"}
  ]
}`;

    const response = await this.chat(
      [{ role: 'user', content: prompt }],
      userId,
      model
    );

    return this.parseJsonResponse(response.content);
  }

  async generateBeatDetails(
    beat: string,
    context: { act: string; previousBeats: string[] },
    userId?: string,
    model?: string
  ): Promise<{
    description: string;
    purpose: string;
    suggestedVisuals: string;
    dialogueHint: string;
    characters: string[];
    duration: number;
  }> {
    const prompt = `详细展开以下情节点：

情节点：${beat}
所处幕次：${context.act}
前置情节点：${context.previousBeats.join(', ')}

请返回JSON：
{
  "description": "详细描述这个情节点要展现的内容",
  "purpose": "这个情节点在故事中的功能和意义",
  "suggestedVisuals": "推荐的视觉呈现方式",
  "dialogueHint": "台词/对白建议",
  "characters": ["需要出场的主要角色"],
  "duration": 建议时长（秒）
}`;

    const response = await this.chat(
      [{ role: 'user', content: prompt }],
      userId,
      model
    );

    return this.parseJsonResponse(response.content);
  }

  async saveStoryline(projectId: string, storyline: StorylineOutput): Promise<string> {
    const document = await prisma.document.create({
      data: {
        id: crypto.randomUUID(),
        project_id: projectId,
        title: storyline.title,
        type: 'storyline',
        content: storyline as any,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return document.id;
  }

  async getStoryline(documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document || document.type !== 'storyline') {
      throw new Error('Storyline not found');
    }

    return document;
  }

  private parseJsonResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('无法解析AI响应');
    } catch (error) {
      logger.error('JSON parsing error', { error });
      throw new Error('故事线解析格式错误');
    }
  }

  private validateOutput(output: any): StorylineOutput {
    return {
      title: output.title || '未命名故事',
      logline: output.logline || '',
      synopsis: output.synopsis || '',
      themes: output.themes || [],
      structure: output.structure || {
        act1: { title: '第一幕', beats: [] },
        act2: { title: '第二幕', beats: [] },
        act3: { title: '第三幕', beats: [] }
      },
      characters: output.characters || [],
      suggestedDuration: output.suggestedDuration || 15,
      suggestedStyle: output.suggestedStyle || '电影风格'
    };
  }
}

export const storylineAgent = new StorylineAgent();
