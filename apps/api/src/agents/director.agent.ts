import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

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

        let lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
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
    userId: string,
    projectId: string,
    scene: ScriptScene,
    visualStyle?: string
  ): Promise<GeneratedShot[]> {
    const prompt = this.buildShotGenerationPrompt(scene, visualStyle);

    const provider = await prisma.aIProvider.findFirst({
      where: { userId, enabled: true },
    });

    if (!provider) {
      throw new Error('未找到启用的 AI 提供商');
    }

    const response = await aiProviderService.chat(provider.id, [
      {
        role: 'system',
        content: '你是一位专业的电影导演，擅长将剧本分解为详细的分镜镜头。请根据场景描述和对话，生成分镜方案。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const shots = this.parseShotResponse(response.content);

    return shots.map((shot, index) => ({
      ...shot,
      chapterNumber: 1,
      episodeNumber: scene.id,
      segmentId: Math.floor(index / 3) + 1,
      cellId: (index % 3) + 1,
      visualStyle: visualStyle || '',
    }));
  }

  private buildShotGenerationPrompt(scene: ScriptScene, visualStyle?: string): string {
    const dialogueText = scene.dialogue
      .map(d => `${d.character}: ${d.lines.join(' ')}`)
      .join('\n');

    return `请为以下场景生成分镜方案：

场景描述: ${scene.description}

对话：
${dialogueText}

${visualStyle ? `视觉风格: ${visualStyle}\n` : ''}

请生成 3-5 个分镜镜头，每个镜头包含：
1. 镜头类型（特写、中景、全景、推镜头、拉镜头、摇镜头等）
2. 动作描述（简短描述镜头中的主要动作）
3. 镜头运动（如需要）
4. 起始帧提示词（用于AI生成起始画面的提示词）
5. 结束帧提示词（用于AI生成结束画面的提示词）

请以JSON格式返回，格式如下：
[
  {
    "cameraType": "特写",
    "actionSummary": "主角表情特写",
    "cameraMovement": "推镜头",
    "startPrompt": "详细描述起始画面",
    "endPrompt": "详细描述结束画面",
    "duration": 5
  }
]`;
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
        content: '你是一位专业的电影导演，擅长优化分镜镜头的提示词，使其更适合 AI 图像生成。',
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
    return `请优化以下分镜镜头的提示词，使其更适合 AI 图像生成：

镜头信息：
- 动作摘要: ${shot.actionSummary || '无'}
- 镜头运动: ${shot.cameraMovement || '无'}
- 场景: ${shot.scene?.location || '无'}
- 角色: ${shot.character?.name || '无'}
- 参考图片数量: ${referenceImages.length}

当前提示词：
- 起始帧: ${shot.startPrompt || '无'}
- 结束帧: ${shot.endPrompt || '无'}

请根据参考图片（如果有）和镜头信息，优化提示词，使其更详细、更具体，包含视觉风格、光线、构图等要素。

请以JSON格式返回，格式如下：
{
  "startPrompt": "优化后的起始帧提示词",
  "endPrompt": "优化后的结束帧提示词"
}`;
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
          content: '你是一位专业的编剧和导演，擅长根据故事大纲生成详细的剧本。请根据提供的信息，生成一个结构完整、对话自然的剧本。',
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

    return `请根据以下信息生成一个详细的剧本：

故事大纲:
${storyOutline}

类型:
${genre}

角色:
${charactersText}

场景:
${settingsText}

请生成一个结构完整的剧本，包含：
1. 场景描述
2. 角色对话
3. 动作描述
4. 情绪氛围

剧本格式示例：

[场景1] 咖啡厅
时间：下午
氛围：温馨

张三：你好，最近怎么样？
李四：还不错，就是工作有点忙。
张三：我理解，慢慢来。

李四端起咖啡，看向窗外。

李四：你说，我们这样的生活，什么时候才能改变？

张三：会好起来的，我相信。`;
  }
}

export const directorAgent = new DirectorAgent();
