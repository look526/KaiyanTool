import { aiProviderService } from '../services/ai/provider.service';
import { logger } from '../lib/logger';

export interface SceneInfo {
  id: string;
  time: string;
  atmosphere: string;
  location: string;
  description: string;
  characters: string[];
  shots: ShotInfo[];
}

export interface ShotInfo {
  id: string;
  sequence: number;
  type: string;
  description: string;
  dialogue?: string;
  action?: string;
  prompt?: string;
}

export interface ScriptStructure {
  title: string;
  summary: string;
  scenes: SceneInfo[];
  characters: CharacterInfo[];
  totalDuration: number;
  estimatedShots: number;
}

export interface CharacterInfo {
  id: string;
  name: string;
  description: string;
  personality: string;
  appearance: string;
}

export class ScriptAnalysisAgent {
  constructor() {}

  async analyzeScript(
    scriptContent: string,
    options: {
      targetDuration?: number;
    } = {}
  ): Promise<ScriptStructure> {
    const { targetDuration = 180 } = options;

    const systemPrompt = `你是一个专业的剧本分析AI助手。你的任务是：
1. 分析剧本内容，提取结构化信息
2. 识别场景、角色、时间、气氛
3. 生成专业的视觉化提示词
4. 根据目标时长规划镜头数量

请严格按照JSON格式返回分析结果。`;

    const userPrompt = `请分析以下剧本内容，目标是生成${targetDuration}秒的短片：

${scriptContent}

请返回以下JSON结构：
{
  "title": "剧本标题",
  "summary": "剧情概要",
  "estimatedDuration": 预估时长（秒）,
  "estimatedShots": 预估镜头数,
  "characters": [
    {
      "name": "角色名",
      "description": "外貌描述",
      "personality": "性格特点"
    }
  ],
  "scenes": [
    {
      "id": "场景1",
      "sequence": 1,
      "time": "时间（日/夜/晨/昏）",
      "atmosphere": "气氛（紧张/温馨/悬疑等）",
      "location": "场景地点",
      "description": "场景描述",
      "characters": ["角色名列表"],
      "shots": [
        {
          "sequence": 1,
          "type": "镜头类型（全景/中景/近景/特写）",
          "description": "镜头描述",
          "action": "动作描述",
          "dialogue": "台词"
        }
      ]
    }
  ]
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
      return this.structureScript(parsed, targetDuration);
    } catch (error) {
      console.error('Script analysis failed:', error);
      throw new Error('剧本分析失败');
    }
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
      throw new Error('剧本解析格式错误');
    }
  }

  private structureScript(analysis: any, targetDuration: number): ScriptStructure {
    return {
      title: analysis.title || '未命名剧本',
      summary: analysis.summary || '',
      estimatedShots: analysis.estimatedShots || Math.ceil(targetDuration / 15),
      totalDuration: analysis.estimatedDuration || targetDuration,
      characters: (analysis.characters || []).map((c: any, i: number) => ({
        id: `char_${i + 1}`,
        name: c.name || `角色${i + 1}`,
        description: c.description || '',
        personality: c.personality || '',
        appearance: c.appearance || ''
      })),
      scenes: (analysis.scenes || []).map((s: any, si: number) => ({
        id: `scene_${si + 1}`,
        time: s.time || '日',
        atmosphere: s.atmosphere || '普通',
        location: s.location || '',
        description: s.description || '',
        characters: s.characters || [],
        shots: (s.shots || []).map((sh: any, shi: number) => ({
          id: `shot_${si + 1}_${shi + 1}`,
          sequence: sh.sequence || shi + 1,
          type: sh.type || '中景',
          description: sh.description || '',
          action: sh.action || '',
          dialogue: sh.dialogue || '',
          prompt: ''
        }))
      }))
    };
  }

  async generateVisualPrompt(
    sceneDescription: string,
    characters: string[],
    context?: {
      sceneImage?: string;
      characterImages?: string[];
    }
  ): Promise<string> {
    const systemPrompt = `你是一个专业的视觉提示词生成专家，擅长将文字描述转化为Midjourney、Stable Diffusion等AI绘图工具的精准提示词。`;

    const userPrompt = `根据以下场景描述，生成专业级的AI绘图提示词：

场景：${sceneDescription}
角色：${characters.join(', ')}
${context?.sceneImage ? '参考场景图像已提供' : ''}
${context?.characterImages ? `角色参考图像已提供${context.characterImages.length}张` : ''}

请生成包含以下要素的提示词：
1. 主体描述（角色、动作、表情）
2. 环境背景（场景、光线、氛围）
3. 画面构图（视角、距离、镜头类型）
4. 风格要求（艺术风格、年代、情绪）
5. 技术参数（宽高比、质量、版本）

格式要求：
- 主要提示词在前，用逗号分隔
- 权重用括号表示，如 (beautiful eyes:1.3)
- 负面提示词单独列出
- 包含英文翻译

请用JSON格式返回：
{
  "mainPrompt": "主提示词（英文）",
  "negativePrompt": "负面提示词（英文）",
  "aspectRatio": "16:9",
  "style": "电影风格",
  "camera": "35mm镜头",
  "lighting": "自然光",
  "mood": "温馨"
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

      return this.buildPromptString(parsed);
    } catch (error) {
      console.error('Prompt generation failed:', error);
      throw new Error('提示词生成失败');
    }
  }

  private buildPromptString(parsed: any): string {
    const parts = [
      parsed.mainPrompt || '',
      parsed.aspectRatio ? `--ar ${parsed.aspectRatio}` : '',
      parsed.style ? `--style ${parsed.style}` : '',
      parsed.version ? `--v ${parsed.version}` : '--v 6'
    ].filter(Boolean);

    return parts.join(' ');
  }

  async calculateShotDensity(
    totalDuration: number,
    sceneCount: number,
    complexity: 'simple' | 'normal' | 'complex' = 'normal'
  ): Promise<{
    totalShots: number;
    shotsPerScene: number[];
    rhythmCurve: number[];
  }> {
    const baseShotsPerMinute = {
      simple: 2,
      normal: 3,
      complex: 4
    };

    const totalMinutes = totalDuration / 60;
    const baseTotalShots = Math.ceil(totalMinutes * baseShotsPerMinute[complexity]);
    const totalShots = Math.max(sceneCount * 2, baseTotalShots);
    
    const shotsPerScene = Array.from({ length: sceneCount }, () =>
      Math.ceil(totalShots / sceneCount)
    );

    const rhythmCurve = this.generateRhythmCurve(totalShots, sceneCount);

    return {
      totalShots,
      shotsPerScene,
      rhythmCurve
    };
  }

  private generateRhythmCurve(totalShots: number, sceneCount: number): number[] {
    const curve: number[] = [];
    const shotsPerScene = totalShots / sceneCount;

    for (let i = 0; i < sceneCount; i++) {
      const intensity = Math.sin((i / sceneCount) * Math.PI);
      curve.push(Math.round(shotsPerScene * (0.8 + intensity * 0.4)));
    }

    return curve;
  }
}

export const scriptAnalysisAgent = new ScriptAnalysisAgent();
