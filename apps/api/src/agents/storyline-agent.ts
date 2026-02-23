import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

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

  async generateStoryline(input: StoryInput): Promise<StorylineOutput> {
    const systemPrompt = `你是一个专业的故事创作AI助手。你的专长是将创意转化为完整的故事线，包括：
1. 故事核心（标题、Logline、Synopsis）
2. 主题提炼
3. 三幕结构设计
4. 关键情节点（Story Beats）
5. 角色弧线设计
6. 风格建议
7. 时长估算

请始终以专业编剧的视角创作，产出可执行的故事蓝图。`;

    const userPrompt = `请为以下故事创意生成完整的故事线：

**基本信息**
- 标题：《${input.title}》
- 类型：${input.genre}
- 目标观众：${input.targetAudience || '大众'}
- 基调：${input.tone || '平衡'}
${input.style ? `- 风格参考：${input.style}` : ''}
- 目标时长：${input.targetDuration || 15} 分钟

**故事概述**
${input.description}

请返回JSON格式的故事线：
{
  "title": "最终确定的标题",
  "logline": "一句话概括故事核心冲突",
  "synopsis": "200字内的故事梗概",
  "themes": ["主题1", "主题2"],
  "structure": {
    "act1": {
      "title": "第一幕标题",
      "beats": ["情节点1", "情节点2", "情节点3"]
    },
    "act2": {
      "title": "第二幕标题",
      "beats": ["情节点1", "情节点2", "情节点3", "情节点4"]
    },
    "act3": {
      "title": "第三幕标题",
      "beats": ["情节点1", "情节点2"]
    }
  },
  "characters": [
    {
      "name": "主角名",
      "role": "主角/配角",
      "arc": "角色成长弧线",
      "description": "角色描述"
    }
  ],
  "suggestedDuration": 建议时长（分钟）,
  "suggestedStyle": "视觉风格建议"
}`;

    try {
      const response = await aiProviderService.chat(
        'default',
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        undefined
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
    feedback: string
  ): Promise<StorylineOutput> {
    const existingStoryline = await prisma.document.findUnique({
      where: { id: storylineId }
    });

    if (!existingStoryline) {
      throw new Error('Storyline not found');
    }

    const content = existingStoryline.content as any;

    const systemPrompt = `你是一个专业的故事编辑助手。根据用户反馈优化故事线。`;

    const userPrompt = `请根据以下反馈优化故事线：

**原始故事线**
${JSON.stringify(content, null, 2)}

**用户反馈**
${feedback}

请返回优化后的完整故事线JSON：`;

    const response = await aiProviderService.chat(
      'default',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      undefined
    );

    const parsed = this.parseJsonResponse(response.content);
    return this.validateOutput(parsed);
  }

  async generateCharacterBackstory(
    characterName: string,
    role: string,
    storyContext: string
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

    const response = await aiProviderService.chat(
      'default',
      [{ role: 'user', content: prompt }],
      undefined
    );

    return this.parseJsonResponse(response.content);
  }

  async generateBeatDetails(
    beat: string,
    context: { act: string; previousBeats: string[] }
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

    const response = await aiProviderService.chat(
      'default',
      [{ role: 'user', content: prompt }],
      undefined
    );

    return this.parseJsonResponse(response.content);
  }

  async saveStoryline(projectId: string, storyline: StorylineOutput): Promise<string> {
    const document = await prisma.document.create({
      data: {
        projectId,
        title: storyline.title,
        type: 'storyline',
        content: storyline as any,
        status: 'completed'
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
