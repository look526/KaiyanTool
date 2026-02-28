import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';
import { DIRECTOR_AGENT } from '../prompts/agents';

interface ScriptScene {
  id: number;
  description: string;
  type: string;
  dialogue: Array<{
    character: string;
    lines: string[];
  }>;
}

interface GeneratedShot {
  sceneId?: string;
  characterId?: string;
  chapterNumber: number;
  episodeNumber: number;
  segmentId: number;
  cellId: number;
  actionSummary: string;
  cameraMovement: string;
  startPrompt: string;
  endPrompt: string;
  duration: number;
  aspectRatio: string;
  visualStyle: string;
}

export class DirectorAgent {
  async generateShotsFromScript(
    userId: string,
    projectId: string,
    scriptContent: string,
    visualStyle?: string
  ): Promise<GeneratedShot[]> {
    try {
      const scenes = this.parseScript(scriptContent);
      const generatedShots: GeneratedShot[] = [];

      for (const scene of scenes) {
        const shotsForScene = await this.generateShotsForScene(
          userId,
          projectId,
          scene,
          visualStyle
        );
        generatedShots.push(...shotsForScene);
      }

      return generatedShots;
    } catch (error) {
      logger.error('导演 Agent 生成失败', { userId, projectId, error });
      throw error;
    }
  }

  private parseScript(content: string): ScriptScene[] {
    const scenes: ScriptScene[] = [];
    const lines = content.split('\n');
    let currentScene: ScriptScene | null = null;
    let sceneId = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const sceneMatch = trimmedLine.match(/^(场景\d+|场景\s*\d+|Scene\s*\d+)\s*[-：:]\s*(.+)/i);
      const bracketSceneMatch = trimmedLine.match(/^\[场景(\d+)\]\s*(.+)/i);

      if (sceneMatch || bracketSceneMatch) {
        if (currentScene) {
          scenes.push(currentScene);
        }
        sceneId++;
        const description = bracketSceneMatch ? bracketSceneMatch[2] : sceneMatch![2];
        const sceneType = bracketSceneMatch?.[1] || sceneMatch![1].replace(/[^\d]/g, '');
        currentScene = {
          id: sceneId,
          description: description.trim(),
          type: sceneType,
          dialogue: [],
        };
        continue;
      }

      const characterMatch = trimmedLine.match(/^([^\uff1a\uff3b:：:]+)[\uff1a\uff3b:：:]\s*(.+)/);
      if (characterMatch && currentScene) {
        const character = characterMatch[1].trim();
        const text = characterMatch[2].trim();

        const lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
        if (lastDialogue && lastDialogue.character === character) {
          lastDialogue.lines.push(text);
        } else {
          currentScene.dialogue.push({
            character,
            lines: [text],
          });
        }
      }
    }

    if (currentScene) {
      scenes.push(currentScene);
    }

    return scenes;
  }

  private async generateShotsForScene(
    _userId: string,
    _projectId: string,
    scene: ScriptScene,
    visualStyle?: string
  ): Promise<GeneratedShot[]> {
    const prompt = this.buildShotGenerationPrompt(scene, visualStyle);

    const provider = await prisma.aIProvider.findFirst({
      where: { userId: _userId, enabled: true },
    });

    if (!provider) {
      throw new Error('未找到启用的 AI 提供商');
    }

    const response = await aiProviderService.chat(provider.id, [
      {
        role: 'system',
        content: DIRECTOR_AGENT.shotGenerationSystem,
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const shots = this.parseShotResponse(response.content);

    return shots.map((shot, index) => ({
      chapterNumber: 1,
      episodeNumber: scene.id,
      segmentId: Math.floor(index / 3) + 1,
      cellId: (index % 3) + 1,
      actionSummary: shot.actionSummary,
      cameraMovement: shot.cameraMovement || '',
      cameraType: shot.cameraType || '',
      startPrompt: shot.startPrompt,
      endPrompt: shot.endPrompt,
      duration: shot.duration || 5,
      aspectRatio: '16:9',
      visualStyle: visualStyle || '',
    }));
  }

  private buildShotGenerationPrompt(scene: ScriptScene, visualStyle?: string): string {
    const dialogueText = scene.dialogue
      .map(d => `${d.character}: ${d.lines.join(' ')}`)
      .join('\n');

    return DIRECTOR_AGENT.shotGenerationPrompt
      .replace('{{sceneDescription}}', scene.description)
      .replace('{{dialogue}}', dialogueText)
      .replace('{{visualStyle}}', visualStyle || '');
  }

  private parseShotResponse(content: string): Array<{
    cameraType: string;
    actionSummary: string;
    cameraMovement: string;
    startPrompt: string;
    endPrompt: string;
    duration: number;
  }> {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('无法解析 AI 响应');
      }

      const shots = JSON.parse(jsonMatch[0]);
      return shots;
    } catch (error) {
      logger.error('解析分镜响应失败', { error, content });
      return [];
    }
  }

  async optimizeShotPrompt(
    userId: string,
    shotId: string,
    referenceImages: string[]
  ): Promise<{ startPrompt: string; endPrompt: string }> {
    const shot = await prisma.shot.findUnique({
      where: { id: shotId },
      include: { scene: true, character: true },
    });

    if (!shot) {
      throw new Error('镜头不存在');
    }

    const prompt = this.buildOptimizationPrompt(shot, referenceImages);

    const provider = await prisma.aIProvider.findFirst({
      where: { userId, enabled: true },
    });

    if (!provider) {
      throw new Error('未找到启用的 AI 提供商');
    }

    const response = await aiProviderService.chat(provider.id, [
      {
        role: 'system',
        content: DIRECTOR_AGENT.optimizationSystem,
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const result = this.parseOptimizationResponse(response.content);
    return result;
  }

  private buildOptimizationPrompt(shot: any, referenceImages: string[]): string {
    return DIRECTOR_AGENT.optimizationPrompt
      .replace('{{actionSummary}}', shot.actionSummary || '无')
      .replace('{{cameraMovement}}', shot.cameraMovement || '无')
      .replace('{{sceneLocation}}', shot.scene?.location || '无')
      .replace('{{characterName}}', shot.character?.name || '无')
      .replace('{{referenceImageCount}}', String(referenceImages.length))
      .replace('{{startPrompt}}', shot.startPrompt || '无')
      .replace('{{endPrompt}}', shot.endPrompt || '无');
  }

  private parseOptimizationResponse(content: string): { startPrompt: string; endPrompt: string } {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法解析 AI 响应');
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        startPrompt: result.startPrompt || '',
        endPrompt: result.endPrompt || '',
      };
    } catch (error) {
      logger.error('解析优化响应失败', { error, content });
      return { startPrompt: '', endPrompt: '' };
    }
  }

  async generateScript(
    userId: string,
    projectId: string,
    storyOutline: string,
    genre: string,
    characters: Array<{
      name: string;
      description: string;
      personality: string;
    }>,
    settings: Array<{
      name: string;
      description: string;
      atmosphere: string;
    }>
  ): Promise<string> {
    try {
      const provider = await prisma.aIProvider.findFirst({
        where: { userId, enabled: true },
      });

      if (!provider) {
        throw new Error('未找到启用的 AI 提供商');
      }

      const prompt = this.buildScriptGenerationPrompt(
        storyOutline,
        genre,
        characters,
        settings
      );

      const response = await aiProviderService.chat(provider.id, [
        {
          role: 'system',
          content: DIRECTOR_AGENT.scriptGenerationSystem,
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      return response.content;
    } catch (error) {
      logger.error('导演 Agent 生成剧本失败', { userId, projectId, error });
      throw error;
    }
  }

  private buildScriptGenerationPrompt(
    storyOutline: string,
    genre: string,
    characters: Array<{
      name: string;
      description: string;
      personality: string;
    }>,
    settings: Array<{
      name: string;
      description: string;
      atmosphere: string;
    }>
  ): string {
    const charactersText = characters
      .map(c => `${c.name}: ${c.description} (性格: ${c.personality})`)
      .join('\n');

    const settingsText = settings
      .map(s => `${s.name}: ${s.description} (氛围: ${s.atmosphere})`)
      .join('\n');

    return DIRECTOR_AGENT.scriptGenerationPrompt
      .replace('{{storyOutline}}', storyOutline)
      .replace('{{genre}}', genre)
      .replace('{{characters}}', charactersText)
      .replace('{{settings}}', settingsText);
  }
}

export const directorAgent = new DirectorAgent();
