import { Request, Response } from 'express';

interface Dialogue {
  character: string;
  lines: string[];
  action?: string;
}

interface Scene {
  id: number;
  description: string;
  type: string;
  dialogue: Dialogue[];
  action?: string;
}

interface ParsedScript {
  scenes: Scene[];
  characters: string[];
}

export const parseScript = (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: '剧本内容不能为空' });
    }

    const scenes: Scene[] = [];
    const characters = new Set<string>();
    const lines = content.split('\n');
    let currentScene: Scene | null = null;
    let sceneId = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const sceneMatch = line.match(/^(场景\d+|场景\s*\d+|Scene\s*\d+)\s*[-：:]\s*(.+)/i);
      const bracketSceneMatch = line.match(/^\[场景(\d+)\]\s*(.+)/i);

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

      const actionMatch = line.match(/^\((.+)\)$/);
      if (actionMatch && currentScene) {
        if (currentScene.dialogue.length === 0) {
          currentScene.action = actionMatch[1].trim();
        } else {
          const lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
          lastDialogue.action = actionMatch[1].trim();
        }
        continue;
      }

      const characterMatch = line.match(/^([^\uff1a\uff3b:：:]+)[\uff1a\uff3b:：:]\s*(.+)/);
      if (characterMatch && currentScene) {
        const character = characterMatch[1].trim();
        const text = characterMatch[2].trim();
        characters.add(character);

        let lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
        if (lastDialogue && lastDialogue.character === character) {
          lastDialogue.lines.push(text);
        } else {
          currentScene.dialogue.push({
            character,
            lines: [text],
          });
        }
        continue;
      }
    }

    if (currentScene) {
      scenes.push(currentScene);
    }

    const result: ParsedScript = {
      scenes,
      characters: Array.from(characters),
    };

    res.json(result);
  } catch (error) {
    console.error('解析剧本失败:', error);
    res.status(500).json({ error: '解析剧本失败' });
  }
};

export const saveScript = async (req: Request, res: Response) => {
  try {
    const { projectId, title, content } = req.body;

    if (!projectId || !title || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const { prisma } = await import('../lib/prisma');

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: title,
        description: content.substring(0, 500),
      },
    });

    res.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('保存剧本失败:', error);
    res.status(500).json({ error: '保存剧本失败' });
  }
};

export const getScript = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const { prisma } = await import('../lib/prisma');

    const project = await prisma.project.findUnique({
      where: { id: projectId as string },
    });

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    res.json({
      title: project.name,
      content: project.description || '',
    });
  } catch (error) {
    console.error('获取剧本失败:', error);
    res.status(500).json({ error: '获取剧本失败' });
  }
};
