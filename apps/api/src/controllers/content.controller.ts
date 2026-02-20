import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../lib/logger';

const prisma = new PrismaClient();

export const createScript = async (req: Request, res: Response) => {
  const currentUser = req.user?.id;
  const { projectId, title, content } = req.body;

  try {
    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    if (!projectId || !title || !content) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: currentUser },
          { members: { some: { userId: currentUser } } },
        ],
      },
    });

    if (!project) {
      logger.warn('项目不存在', { userId: currentUser, projectId });
      return res.status(404).json({ error: '项目不存在' });
    }

    const script = await prisma.script.create({
      data: {
        title,
        content,
        project: { connect: { id: projectId } },
      },
      include: {
        scenes: true,
      },
    });

    res.status(201).json(script);
    logger.info('剧本创建成功', { userId: currentUser, projectId, scriptId: script.id });
  } catch (error) {
    logger.error('创建剧本失败', { userId: currentUser, error });
    res.status(500).json({ error: '创建剧本失败' });
  }
};

export const getScripts = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).userId || req.user?.id;
    const { projectId } = req.params;

    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: currentUser },
          { members: { some: { userId: currentUser } } },
        ],
      },
    });

    if (!project) {
      logger.warn('项目不存在', { userId: currentUser, projectId });
      return res.status(404).json({ error: '项目不存在' });
    }

    const scripts = await prisma.script.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        scenes: true,
      },
    });

    res.json(scripts);
  } catch (error) {
    logger.error('获取剧本列表失败', { error });
    res.status(500).json({ error: '获取剧本列表失败' });
  }
};

export const parseScript = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: '剧本内容不能为空' });
    }

    const scenes: any[] = [];
    const characters = new Set<string>();
    const lines = content.split('\n');

    let currentScene: any = null;
    let sceneCounter = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) continue;

      if (trimmedLine.startsWith('场景') || trimmedLine.match(/^[A-Z]+\s*-\s*\d+/)) {
        if (currentScene) {
          scenes.push(currentScene);
        }
        currentScene = {
          id: sceneCounter,
          description: trimmedLine,
          type: 'SCENE',
          dialogue: [],
        };
        sceneCounter++;
        continue;
      }

      if (trimmedLine.match(/^[A-Z]+:/)) {
        const characterName = trimmedLine.split(':')[0];
        characters.add(characterName);
        
        if (currentScene) {
          const existingCharacter = currentScene.dialogue.find((d: any) => d.character === characterName);
          if (existingCharacter) {
            existingCharacter.lines.push(trimmedLine.substring(characterName.length + 1).trim());
          } else {
            currentScene.dialogue.push({
              character: characterName,
              lines: [trimmedLine.substring(characterName.length + 1).trim()],
            });
          }
        }
        continue;
      }

      if (currentScene && trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
        if (currentScene.dialogue.length > 0) {
          const lastDialogue = currentScene.dialogue[currentScene.dialogue.length -1];
          lastDialogue.action = trimmedLine.slice(1, -1);
        }
        continue;
      }

      if (currentScene) {
        if (!currentScene.action) {
          currentScene.action = trimmedLine;
        } else {
          currentScene.action += ' ' + trimmedLine;
        }
      }
    }

    if (currentScene) {
      scenes.push(currentScene);
    }

    res.json({
      scenes,
      characters: Array.from(characters),
      totalScenes: scenes.length,
    });
  } catch (error) {
    logger.error('解析剧本失败', { error });
    res.status(500).json({ error: '解析剧本失败' });
  }
};

export const updateScript = async (req: Request, res: Response) => {
  const currentUser = (req as any).userId || req.user?.id;
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    const script = await prisma.script.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: currentUser },
            { members: { some: { userId: currentUser } } },
          ],
        },
      },
    });

    if (!script) {
      logger.warn('剧本不存在或无权限', { userId: currentUser, scriptId: id });
      return res.status(404).json({ error: '剧本不存在或无权限' });
    }

    const updatedScript = await prisma.script.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
      },
    });

    res.json(updatedScript);
    logger.info('剧本更新成功', { userId: currentUser, scriptId: id });
  } catch (error) {
    logger.error('更新剧本失败', { userId: currentUser, scriptId: id, error });
    res.status(500).json({ error: '更新剧本失败' });
  }
};

export const deleteScript = async (req: Request, res: Response) => {
  const currentUser = (req as any).userId || req.user?.id;
  const { id } = req.params;

  try {
    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    const script = await prisma.script.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: currentUser },
            { members: { some: { userId: currentUser } } },
          ],
        },
      },
    });

    if (!script) {
      logger.warn('剧本不存在或无权限', { userId: currentUser, scriptId: id });
      return res.status(404).json({ error: '剧本不存在或无权限' });
    }

    await prisma.script.delete({
      where: { id },
    });

    res.json({ message: '剧本已删除' });
    logger.info('剧本删除成功', { userId: currentUser, scriptId: id });
  } catch (error) {
    logger.error('删除剧本失败', { userId: currentUser, scriptId: id, error });
    res.status(500).json({ error: '删除剧本失败' });
  }
};

export const getScript = async (req: Request, res: Response) => {
  const currentUser = (req as any).userId || req.user?.id;
  const { id } = req.params;

  try {
    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    const script = await prisma.script.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: currentUser },
            { members: { some: { userId: currentUser } } },
          ],
        },
      },
      include: {
        scenes: true,
      },
    });

    if (!script) {
      return res.status(404).json({ error: '剧本不存在' });
    }

    res.json(script);
    logger.info('获取剧本成功', { userId: currentUser, scriptId: id });
  } catch (error) {
    logger.error('获取剧本失败', { userId: currentUser, scriptId: id, error });
    res.status(500).json({ error: '获取剧本失败' });
  }
};

export const createNovel = async (req: Request, res: Response) => {
  const currentUser = (req as any).userId || req.user?.id;
  const { projectId, title, content } = req.body;

  try {
    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    if (!projectId || !title || !content) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: currentUser },
          { members: { some: { userId: currentUser } } },
        ],
      },
    });

    if (!project) {
      logger.warn('项目不存在', { userId: currentUser, projectId });
      return res.status(404).json({ error: '项目不存在' });
    }

    const novel = await prisma.novel.create({
      data: {
        title,
        content,
        project: { connect: { id: projectId } },
      },
    });

    res.status(201).json(novel);
    logger.info('小说创建成功', { userId: currentUser, projectId, novelId: novel.id });
  } catch (error) {
    logger.error('创建小说失败', { userId: currentUser, error });
    res.status(500).json({ error: '创建小说失败' });
  }
};

export const getNovels = async (req: Request, res: Response) => {
  const currentUser = req.user?.id;
  const { projectId } = req.params;

  try {
    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: currentUser },
          { members: { some: { userId: currentUser } } },
        ],
      },
    });

    if (!project) {
      logger.warn('项目不存在', { userId: currentUser, projectId });
      return res.status(404).json({ error: '项目不存在' });
    }

    const novels = await prisma.novel.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(novels);
  } catch (error) {
    logger.error('获取小说列表失败', { userId: currentUser, projectId, error });
    res.status(500).json({ error: '获取小说列表失败' });
  }
};

export const parseNovel = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: '小说内容不能为空' });
    }

    const chapters: any[] = [];
    const lines = content.split('\n');

    let currentChapter: any = null;
    let chapterCounter = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) continue;

      const chapterMatch = trimmedLine.match(/^第[一二三四五六七八九十百千\d]+章/);

      if (chapterMatch) {
        if (currentChapter) {
          chapters.push(currentChapter);
        }
        currentChapter = {
          id: chapterCounter,
          title: trimmedLine,
          content: '',
        };
        chapterCounter++;
        continue;
      }

      if (currentChapter) {
        if (currentChapter.content) {
          currentChapter.content += '\n' + trimmedLine;
        } else {
          currentChapter.content = trimmedLine;
        }
      }
    }

    if (currentChapter) {
      chapters.push(currentChapter);
    }

    res.json({
      chapters,
      totalChapters: chapters.length,
    });
  } catch (error) {
    logger.error('解析小说失败', { error });
    res.status(500).json({ error: '解析小说失败' });
  }
};
