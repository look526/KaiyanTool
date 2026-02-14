import { AIProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';

interface OutlineInput {
  storylineId: string;
  title: string;
  genre: string;
  targetDuration: number;
  style?: string;
  additionalNotes?: string;
}

interface OutlineOutput {
  title: string;
  summary: string;
  episodes: Array<{
    id: number;
    title: string;
    summary: string;
    scenes: Array<{
      id: number;
      title: string;
      location: string;
      time: string;
      description: string;
      characters: string[];
      duration: number;
    }>;
    duration: number;
  }>;
  totalScenes: number;
  estimatedDuration: number;
  pacing: {
    overall: 'slow' | 'moderate' | 'fast';
    breakdown: Array<{ act: string; pace: string }>;
  };
}

export class OutlineAgent {
  private provider: AIProviderService;

  constructor() {
    this.provider = new AIProviderService();
  }

  async generateOutline(input: OutlineInput): Promise<OutlineOutput> {
    const storyline = await prisma.document.findUnique({
      where: { id: input.storylineId }
    });

    if (!storyline || storyline.type !== 'storyline') {
      throw new Error('Storyline not found');
    }

    const storylineContent = storyline.content as any;

    const systemPrompt = `你是一个专业的大纲策划AI助手。你的专长是将故事线转化为详细的影视大纲，包括：
1. 集数划分
2. 每集场景规划
3. 场景详细描述（地点、时间、人物、动作）
4. 时长分配
5. 节奏把控

请始终以导演和制片人的视角规划，确保可执行性和商业价值。`;

    const userPrompt = `请基于以下故事线生成详细大纲：

**故事线信息**
- 标题：${storylineContent.title}
- Logline：${storylineContent.logline}
- Synopsis：${storylineContent.synopsis}
- 角色：${JSON.stringify(storylineContent.characters)}
- 结构：${JSON.stringify(storylineContent.structure)}

**大纲需求**
- 目标类型：${input.genre}
- 目标时长：${input.targetDuration} 分钟
- 风格：${input.style || storylineContent.suggestedStyle}
${input.additionalNotes ? `- 备注：${input.additionalNotes}` : ''}

请返回JSON格式大纲：
{
  "title": "最终确定的标题",
  "summary": "100字内的大纲概述",
  "episodes": [
    {
      "id": 1,
      "title": "第1集标题",
      "summary": "本集概述",
      "scenes": [
        {
          "id": 1,
          "title": "场景标题",
          "location": "场景地点（内/外）",
          "time": "时间（日/夜/晨/昏）",
          "description": "场景详细描述",
          "characters": ["角色1", "角色2"],
          "duration": 建议时长（秒）
        }
      ],
      "duration": 本集总时长（秒）
    }
  ],
  "totalScenes": 场景总数,
  "estimatedDuration": 预估总时长（秒）,
  "pacing": {
    "overall": "moderate",
    "breakdown": [
      {"act": "第一幕", "pace": "节奏描述"}
    ]
  }
}`;

    try {
      const response = await this.provider.complete(
        {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.6,
          maxTokens: 4000
        },
        'outline-generation'
      );

      const parsed = this.parseJsonResponse(response.content);
      return this.validateOutput(parsed);
    } catch (error) {
      console.error('Outline generation failed:', error);
      throw new Error('大纲生成失败');
    }
  }

  async refineOutline(
    outlineId: string,
    feedback: string
  ): Promise<OutlineOutput> {
    const existingOutline = await prisma.document.findUnique({
      where: { id: outlineId }
    });

    if (!existingOutline) {
      throw new Error('Outline not found');
    }

    const prompt = `请根据反馈优化大纲：

**原始大纲**
${JSON.stringify(existingOutline.content, null, 2)}

**用户反馈**
${feedback}

请返回优化后的完整大纲JSON：`;

    const response = await this.provider.complete(
      { messages: [{ role: 'user', content: prompt }], temperature: 0.6, maxTokens: 4000 },
      'outline-refinement'
    );

    const parsed = this.parseJsonResponse(response.content);
    return this.validateOutput(parsed);
  }

  async expandScene(
    sceneId: string,
    detail: 'dialogue' | 'action' | 'visual' | 'full'
  ): Promise<{
    expandedContent: string;
    suggestedShots: string[];
    dialogueLines: Array<{ character: string; line: string }>;
    visualDirections: string[];
  }> {
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId }
    });

    if (!scene) {
      throw new Error('Scene not found');
    }

    const prompt = `请详细展开以下场景：

场景ID：${sceneId}
当前描述：${scene.description}
详情级别：${detail}

请返回JSON：
{
  "expandedContent": "详细展开的场景描述",
  "suggestedShots": ["建议镜头1", "建议镜头2"],
  "dialogueLines": [
    {"character": "角色名", "line": "台词"}
  ],
  "visualDirections": ["视觉指导1"]
}`;

    const response = await this.provider.complete(
      { messages: [{ role: 'user', content: prompt }], temperature: 0.6, maxTokens: 2000 },
      'scene-expansion'
    );

    return this.parseJsonResponse(response.content);
  }

  async generateEpisodeSummary(
    episodeNumber: number,
    outlineId: string
  ): Promise<{
    hook: string;
    mainConflict: string;
    keyEvents: string[];
    cliffhanger: string;
    callToNext: string;
  }> {
    const outline = await prisma.document.findUnique({
      where: { id: outlineId }
    });

    if (!outline) {
      throw new Error('Outline not found');
    }

    const content = outline.content as any;
    const episode = content.episodes?.find((e: any) => e.id === episodeNumber);

    if (!episode) {
      throw new Error('Episode not found');
    }

    const prompt = `请为第${episodeNumber}集生成吸引人的摘要：

**本集信息**
标题：${episode.title}
概述：${episode.summary}
场景数：${episode.scenes?.length || 0}

请返回JSON：
{
  "hook": "开场钩子（吸引观众注意的一句话）",
  "mainConflict": "本集主要冲突",
  "keyEvents": ["关键事件1", "关键事件2", "关键事件3"],
  "cliffhanger": "结尾悬念",
  "callToNext": "引向下一集"
}`;

    const response = await this.provider.complete(
      { messages: [{ role: 'user', content: prompt }], temperature: 0.7, maxTokens: 800 },
      'episode-summary'
    );

    return this.parseJsonResponse(response.content);
  }

  async saveOutline(projectId: string, outline: OutlineOutput): Promise<string> {
    const document = await prisma.document.create({
      data: {
        projectId,
        title: outline.title,
        type: 'outline',
        content: outline as any,
        status: 'completed'
      }
    });

    return document.id;
  }

  async getOutline(documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document || document.type !== 'outline') {
      throw new Error('Outline not found');
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
      console.error('JSON parsing error:', error);
      throw new Error('大纲解析格式错误');
    }
  }

  private validateOutput(output: any): OutlineOutput {
    return {
      title: output.title || '未命名大纲',
      summary: output.summary || '',
      episodes: output.episodes || [],
      totalScenes: output.totalScenes || 0,
      estimatedDuration: output.estimatedDuration || 0,
      pacing: output.pacing || {
        overall: 'moderate',
        breakdown: []
      }
    };
  }
}

export const outlineAgent = new OutlineAgent();
