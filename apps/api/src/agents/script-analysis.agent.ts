import { callAIWithPrompt } from '../services/ai/ai-call.service';
import { SCRIPT_ANALYSIS_AGENT, VISUAL_PROMPT_GENERATOR } from '../prompts/agents';

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

    const systemPrompt = SCRIPT_ANALYSIS_AGENT.systemPrompt;

    const userPrompt = SCRIPT_ANALYSIS_AGENT.userPromptTemplate
      .replace('{{targetDuration}}', String(targetDuration))
      .replace('{{scriptContent}}', scriptContent);

    try {
      const response = await callAIWithPrompt(systemPrompt, userPrompt, undefined);

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
    const systemPrompt = VISUAL_PROMPT_GENERATOR.systemPrompt;

    const userPrompt = VISUAL_PROMPT_GENERATOR.userPromptTemplate
      .replace('{{sceneDescription}}', sceneDescription)
      .replace('{{characters}}', characters.join(', '))
      .replace('{{sceneImage}}', context?.sceneImage ? 'true' : '')
      .replace('{{characterImages}}', context?.characterImages ? 'true' : '')
      .replace('{{characterImageCount}}', String(context?.characterImages?.length || 0));

    try {
      const response = await callAIWithPrompt(systemPrompt, userPrompt, undefined);

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
