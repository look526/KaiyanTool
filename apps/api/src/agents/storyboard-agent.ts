import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';
import { STORYBOARD_STYLE_TEMPLATES, STORYBOARD_AGENT } from '../prompts/agents';

interface StoryboardInput {
  outlineId: string;
  episodeId?: number;
  style?: string;
  targetAspectRatio?: string;
  shotStyle?: 'cinematic' | 'anime' | 'realistic' | 'stylized';
}

interface StoryboardOutput {
  title: string;
  shots: Array<{
    id: string;
    type: 'wide' | 'medium' | 'closeup' | 'extreme-closeup' | 'insert' | 'transition';
    description: string;
    visualPrompt: string;
    negativePrompt: string;
    duration: number;
    dialogue?: string;
    action?: string;
    camera?: {
      movement: string;
      angle: string;
      distance: string;
    };
    notes?: string;
  }>;
  totalDuration: number;
  totalShots: number;
  sceneBreakdown: Array<{
    sceneId: string;
    sceneNumber: number;
    title: string;
    shots: string[];
    duration: number;
  }>;
  styleGuide: {
    visualStyle: string;
    colorPalette: string[];
    lighting: string;
    mood: string;
  };
}

export class StoryboardAgent {
  constructor() {}

  async generateStoryboard(input: StoryboardInput): Promise<StoryboardOutput> {
    let outline: any;

    if (input.outlineId) {
      const document = await prisma.document.findUnique({
        where: { id: input.outlineId }
      });

      if (!document || document.type !== 'outline') {
        throw new Error('Outline not found');
      }

      outline = document.content;

      if (input.episodeId && outline.episodes) {
        outline.episodes = outline.episodes.filter((e: any) => e.id === input.episodeId);
      }
    } else {
      throw new Error('Outline ID is required');
    }

    const styleInfo = STORYBOARD_STYLE_TEMPLATES[input.shotStyle || 'cinematic'] || STORYBOARD_STYLE_TEMPLATES.cinematic;

    const systemPrompt = STORYBOARD_AGENT.systemPrompt
      .replace('{{styleKeywords}}', styleInfo.keywords.join(', '))
      .replace('{{qualityModifiers}}', styleInfo.qualityModifiers.join(', '))
      .replace('{{lighting}}', styleInfo.lighting.join(', '))
      .replace('{{negative}}', styleInfo.negative.join(', '));

    const userPrompt = STORYBOARD_AGENT.userPromptTemplate
      .replace('{{outline}}', JSON.stringify(outline, null, 2))
      .replace('{{shotStyle}}', input.shotStyle || 'cinematic')
      .replace('{{targetAspectRatio}}', input.targetAspectRatio || '16:9')
      .replace('{{style}}', input.style || '电影质感');

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
      logger.error('Storyboard generation failed', { error });
      throw new Error('分镜生成失败');
    }
  }

  async refineShot(
    shotId: string,
    feedback: string
  ): Promise<StoryboardOutput['shots'][0]> {
    const shot = await prisma.shot.findUnique({
      where: { id: shotId }
    });

    if (!shot) {
      throw new Error('Shot not found');
    }

    const prompt = `请根据反馈优化镜头：

**原始镜头**
序列：${shot.sequence}
描述：${shot.description}
提示词：${(shot as any).prompt}

**用户反馈**
${feedback}

请返回优化后的镜头信息JSON：
{
  "description": "优化后的描述",
  "visualPrompt": "优化后的提示词",
  "negativePrompt": "优化后的负面提示词",
  "duration": 调整后的时长（秒）,
  "camera": {
    "movement": "优化后的运镜",
    "angle": "优化后的角度",
    "distance": "优化后的距离"
  }
}`;

    const response = await aiProviderService.chat(
      'default',
      [{ role: 'user', content: prompt }],
      undefined
    );

    const parsed = this.parseJsonResponse(response.content);
    return {
      id: shotId,
      type: (shot as any).type || 'medium',
      description: parsed.description || '',
      visualPrompt: parsed.visualPrompt || '',
      negativePrompt: parsed.negativePrompt || '',
      duration: parsed.duration || 3,
      camera: parsed.camera,
      notes: parsed.notes
    };
  }

  async generateVariations(
    baseShotId: string,
    count: number = 4
  ): Promise<Array<{
    description: string;
    visualPrompt: string;
    variation: number;
  }>> {
    const baseShot = await prisma.shot.findUnique({
      where: { id: baseShotId }
    });

    if (!baseShot) {
      throw new Error('Shot not found');
    }

    const prompt = `请基于以下镜头生成${count}个变体：

基础镜头：
${JSON.stringify({
  description: (baseShot as any).description,
  prompt: (baseShot as any).prompt,
  type: (baseShot as any).type
}, null, 2)}

请为每个变体保持核心元素不变，但调整：
- 构图角度
- 光线方向
- 色彩倾向
- 氛围强度

请返回JSON数组：
[
  {
    "variation": 1,
    "description": "变体描述",
    "visualPrompt": "调整后的提示词"
  }
]
`;

    const response = await aiProviderService.chat(
      'default',
      [{ role: 'user', content: prompt }],
      undefined
    );

    return this.parseJsonResponse(response.content);
  }

  async generateTransition(
    fromShotId: string,
    toShotId: string,
    transitionType: 'dissolve' | 'wipe' | 'fade' | 'match-cut' | 'jump-cut'
  ): Promise<{
    description: string;
    visualPrompt: string;
    suggestedDuration: number;
    technicalNotes: string;
  }> {
    const [fromShot, toShot] = await Promise.all([
      prisma.shot.findUnique({ where: { id: fromShotId } }),
      prisma.shot.findUnique({ where: { id: toShotId } })
    ]);

    if (!fromShot || !toShot) {
      throw new Error('Shot not found');
    }

    const prompt = `请设计两个镜头之间的转场：

起始镜头：${(fromShot as any).description}
结束镜头：${(toShot as any).description}
转场类型：${transitionType}

请返回JSON：
{
  "description": "转场设计描述",
  "visualPrompt": "视觉提示词",
  "suggestedDuration": 建议时长（秒）,
  "technicalNotes": "技术说明"
}`;

    const response = await aiProviderService.chat(
      'default',
      [{ role: 'user', content: prompt }],
      undefined
    );

    return this.parseJsonResponse(response.content);
  }

  async saveStoryboard(projectId: string, storyboard: StoryboardOutput): Promise<string[]> {
    const shotIds: string[] = [];

    for (const shot of storyboard.shots) {
      const createdShot = await prisma.shot.create({
        data: {
          projectId,
          actionSummary: shot.description,
          startPrompt: shot.visualPrompt,
          duration: shot.duration,
          cameraMovement: shot.camera?.movement
        }
      });

      shotIds.push(createdShot.id);
    }

    return shotIds;
  }

  async exportToFormat(
    projectId: string,
    format: 'pdf' | 'csv' | 'json' | 'fcpxml' | 'drp'
  ): Promise<string> {
    const shots = await prisma.shot.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });

    switch (format) {
      case 'json':
        return JSON.stringify(shots.map((s: any, index: number) => ({
          sequence: index + 1,
          description: s.actionSummary,
          prompt: s.startPrompt,
          duration: s.duration
        })), null, 2);

      case 'csv': {
        const headers = 'Sequence,Type,Description,Prompt,Duration\n';
        const rows = shots.map((s: any, index: number) =>
          `${index + 1},${s.cameraMovement || 'medium'},"${s.actionSummary}","${s.startPrompt || ''}",${s.duration}`
        ).join('\n');
        return headers + rows;
      }

      case 'fcpxml':
        return this.generateFCPXML(shots);

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private generateFCPXML(shots: any[]): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml PUBLIC "-//Apple//DTD FCPXML 1.9//EN" "http://www.apple.com/DTDs/FinalCutPro-XML-1.9.dtd">
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat1080p24" frameDuration="100/2400s" width="1920" height="1080"/>
  </resources>
  <library>
    <project name="Storyboard" uid="PROJECT_UID">
      <sequence format="r1" duration="${shots.reduce((acc, s) => acc + s.duration, 0)}/24s">
        <spine>
          ${shots.map((s: any, i: number) => `
          <asset-clip name="Shot ${i + 1}" duration="${s.duration}/24s" offset="${shots.slice(0, i).reduce((acc, prev) => acc + prev.duration, 0)}/24s">
            <metadata>
              <笠 name="Description">${s.actionSummary}</笠>
            </metadata>
          </asset-clip>
          `).join('')}
        </spine>
      </sequence>
    </project>
  </library>
</fcpxml>`;
  }

  private parseJsonResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/) || content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('无法解析AI响应');
    } catch (error) {
      logger.error('JSON parsing error', { error });
      throw new Error('分镜解析格式错误');
    }
  }

  private validateOutput(output: any): StoryboardOutput {
    return {
      title: output.title || '未命名分镜',
      shots: output.shots || [],
      totalDuration: output.totalDuration || 0,
      totalShots: output.totalShots || 0,
      sceneBreakdown: output.sceneBreakdown || [],
      styleGuide: output.styleGuide || {
        visualStyle: '',
        colorPalette: [],
        lighting: '',
        mood: ''
      }
    };
  }
}

export const storyboardAgent = new StoryboardAgent();
