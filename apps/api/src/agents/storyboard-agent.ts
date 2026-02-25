import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

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

    const styleInfo = STYLE_TEMPLATES[input.shotStyle || 'cinematic'] || STYLE_TEMPLATES.cinematic;

    const systemPrompt = `你是一个专业的分镜师AI助手。你的专长是将剧本/大纲转化为专业分镜，包含：
1. 详细的镜头描述
2. 专业的视觉提示词（Midjourney/SD/Flux Kontext格式）
3. 运镜设计
4. 时长规划
5. 视觉风格指南

**当前使用的风格模板：**
- 风格关键词：${styleInfo.keywords.join(', ')}
- 质量修饰词：${styleInfo.qualityModifiers.join(', ')}
- 光线设置：${styleInfo.lighting.join(', ')}
- 负面提示词：${styleInfo.negative.join(', ')}

**提示词构建规则：**
提示词格式应该是：[基础描述] + [风格关键词] + [质量修饰词] + [光线] + [负面提示词]

例如：
正面提示词：A cinematic shot of a character walking through a forest, ${styleInfo.keywords.join(', ')}, ${styleInfo.qualityModifiers.join(', ')}, ${styleInfo.lighting.join(', ')}
负面提示词：${styleInfo.negative.join(', ')}

你的产出将被用于AI视频生成，所以提示词需要精确、可执行。`;

    const userPrompt = `请将以下大纲转化为详细分镜：

**大纲信息**
${JSON.stringify(outline, null, 2)}

**分镜需求**
- 风格：${input.shotStyle || 'cinematic'}
- 宽高比：${input.targetAspectRatio || '16:9'}
- 视觉风格：${input.style || '电影质感'}

请返回JSON格式分镜：
{
  "title": "分镜标题",
  "shots": [
    {
      "id": "shot_1",
      "sequence": 1,
      "type": "wide",
      "description": "镜头详细描述",
      "visualPrompt": "Midjourney格式的视觉提示词",
      "negativePrompt": "负面提示词",
      "duration": 3,
      "dialogue": "可选的台词",
      "action": "动作描述",
      "camera": {
        "movement": "推/拉/摇/移/跟/固定",
        "angle": "水平/俯视/仰视",
        "distance": "远景/全景/中景/近景/特写"
      },
      "notes": "额外备注"
    }
  ],
  "totalDuration": 总时长（秒）,
  "totalShots": 镜头总数,
  "sceneBreakdown": [
    {
      "sceneId": "scene_1",
      "sceneNumber": 1,
      "title": "场景标题",
      "shots": ["shot_1", "shot_2"],
      "duration": 场景总时长
    }
  ],
  "styleGuide": {
    "visualStyle": "整体视觉风格描述",
    "colorPalette": ["主色调1", "主色调2", "主色调3"],
    "lighting": "光线风格",
    "mood": "整体氛围"
  }
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
