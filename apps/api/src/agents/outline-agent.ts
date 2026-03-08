import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';
import { OUTLINE_AGENT, OUTLINE_AUX_PROMPTS } from '../prompts/agents';
import * as crypto from 'crypto';

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
  constructor() {}

  async generateOutline(input: OutlineInput): Promise<OutlineOutput> {
    const storyline = await prisma.document.findUnique({
      where: { id: input.storylineId }
    });

    if (!storyline || storyline.type !== 'storyline') {
      throw new Error('Storyline not found');
    }

    const storylineContent = storyline.content as any;

    const systemPrompt = OUTLINE_AGENT.systemPrompt;

    const userPrompt = OUTLINE_AGENT.userPromptTemplate
      .replace('{{storylineTitle}}', storylineContent.title)
      .replace('{{storylineLogline}}', storylineContent.logline)
      .replace('{{storylineSynopsis}}', storylineContent.synopsis)
      .replace('{{characters}}', JSON.stringify(storylineContent.characters))
      .replace('{{structure}}', JSON.stringify(storylineContent.structure))
      .replace('{{genre}}', input.genre)
      .replace('{{targetDuration}}', String(input.targetDuration))
      .replace('{{style}}', input.style || storylineContent.suggestedStyle)
      .replace('{{additionalNotes}}', input.additionalNotes || '');

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

    const prompt = OUTLINE_AUX_PROMPTS.refineOutline.userPromptTemplate
      .replace('{{originalOutline}}', JSON.stringify(existingOutline.content, null, 2))
      .replace('{{feedback}}', feedback);

    const response = await aiProviderService.chat(
      'default',
      [
        { role: 'system', content: OUTLINE_AUX_PROMPTS.refineOutline.systemPrompt },
        { role: 'user', content: prompt }
      ],
      undefined
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

    const prompt = OUTLINE_AUX_PROMPTS.expandScene.userPromptTemplate
      .replace('{{title}}', sceneId)
      .replace('{{description}}', scene.location || '')
      .replace('{{characters}}', detail);

    const response = await aiProviderService.chat(
      'default',
      [
        { role: 'system', content: OUTLINE_AUX_PROMPTS.expandScene.systemPrompt },
        { role: 'user', content: prompt }
      ],
      undefined
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

    const prompt = OUTLINE_AUX_PROMPTS.generateEpisodeSummary.userPromptTemplate
      .replace('{{title}}', episode.title || '')
      .replace('{{scenes}}', String(episode.scenes?.length || 0));

    const response = await aiProviderService.chat(
      'default',
      [
        { role: 'system', content: OUTLINE_AUX_PROMPTS.generateEpisodeSummary.systemPrompt },
        { role: 'user', content: prompt }
      ],
      undefined
    );

    return this.parseJsonResponse(response.content);
  }

  async saveOutline(projectId: string, outline: OutlineOutput): Promise<string> {
    const document = await prisma.document.create({
      data: {
        id: crypto.randomUUID(),
        project_id: projectId,
        title: outline.title,
        type: 'outline',
        content: outline as any,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date()
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
