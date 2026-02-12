import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

class NovelController {
  async createNovel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId, title, content } = req.body

      const novel = await prisma.novel.create({
        data: {
          projectId,
          title,
          content: content || '',
        },
      })

      logger.info('小说创建成功', { userId: req.userId, novelId: novel.id })
      res.status(201).json(novel)
    } catch (error) {
      logger.error('创建小说失败', { error, projectId: req.body.projectId })
      res.status(500).json({ error: 'Failed to create novel' })
    }
  }

  async getNovelsByProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId } = req.params

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId } } },
          ],
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const novels = await prisma.novel.findMany({
        where: { projectId },
        include: {
          chapters: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      res.json(novels)
    } catch (error) {
      logger.error('获取小说列表失败', { error, projectId: req.params.projectId })
      res.status(500).json({ error: 'Failed to get novels' })
    }
  }

  async getNovelById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const novel = await prisma.novel.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId } } },
            ],
          },
        },
        include: {
          chapters: {
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!novel) {
        res.status(404).json({ error: 'Novel not found' })
        return
      }

      res.json(novel)
    } catch (error) {
      logger.error('获取小说详情失败', { error, novelId: req.params.id })
      res.status(500).json({ error: 'Failed to get novel' })
    }
  }

  async updateNovel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { title, content } = req.body

      const novel = await prisma.novel.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!novel) {
        res.status(404).json({ error: 'Novel not found or no permission' })
        return
      }

      const updated = await prisma.novel.update({
        where: { id },
        data: {
          title: title ?? novel.title,
          content: content ?? novel.content,
        },
      })

      logger.info('小说更新成功', { userId: req.userId, novelId: id })
      res.json(updated)
    } catch (error) {
      logger.error('更新小说失败', { error, novelId: req.params.id })
      res.status(500).json({ error: 'Failed to update novel' })
    }
  }

  async deleteNovel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const novel = await prisma.novel.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!novel) {
        res.status(404).json({ error: 'Novel not found or no permission' })
        return
      }

      await prisma.novel.delete({
        where: { id },
      })

      logger.info('小说删除成功', { userId: req.userId, novelId: id })
      res.json({ message: 'Novel deleted successfully' })
    } catch (error) {
      logger.error('删除小说失败', { error, novelId: req.params.id })
      res.status(500).json({ error: 'Failed to delete novel' })
    }
  }

  async createChapter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { novelId } = req.params
      const { title, content } = req.body

      const novel = await prisma.novel.findFirst({
        where: {
          id: novelId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!novel) {
        res.status(404).json({ error: 'Novel not found or no permission' })
        return
      }

      const maxOrder = await prisma.chapter.findFirst({
        where: { novelId },
        orderBy: { order: 'desc' },
        select: { order: true },
      })

      const chapter = await prisma.chapter.create({
        data: {
          novelId,
          title,
          content: content || '',
          order: (maxOrder?.order ?? 0) + 1,
        },
      })

      logger.info('章节创建成功', { userId: req.userId, chapterId: chapter.id })
      res.status(201).json(chapter)
    } catch (error) {
      logger.error('创建章节失败', { error, novelId: req.params.novelId })
      res.status(500).json({ error: 'Failed to create chapter' })
    }
  }

  async getChaptersByNovel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { novelId } = req.params

      const novel = await prisma.novel.findFirst({
        where: {
          id: novelId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId } } },
            ],
          },
        },
      })

      if (!novel) {
        res.status(404).json({ error: 'Novel not found' })
        return
      }

      const chapters = await prisma.chapter.findMany({
        where: { novelId },
        orderBy: { order: 'asc' },
      })

      res.json(chapters)
    } catch (error) {
      logger.error('获取章节列表失败', { error, novelId: req.params.novelId })
      res.status(500).json({ error: 'Failed to get chapters' })
    }
  }

  async updateChapter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { novelId, id } = req.params
      const { title, content, order } = req.body

      const novel = await prisma.novel.findFirst({
        where: {
          id: novelId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!novel) {
        res.status(404).json({ error: 'Novel not found or no permission' })
        return
      }

      const updated = await prisma.chapter.update({
        where: { id },
        data: {
          title,
          content,
          order,
        },
      })

      logger.info('章节更新成功', { userId: req.userId, chapterId: id })
      res.json(updated)
    } catch (error) {
      logger.error('更新章节失败', { error, chapterId: req.params.id })
      res.status(500).json({ error: 'Failed to update chapter' })
    }
  }

  async deleteChapter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { novelId, id } = req.params

      const novel = await prisma.novel.findFirst({
        where: {
          id: novelId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!novel) {
        res.status(404).json({ error: 'Novel not found or no permission' })
        return
      }

      await prisma.chapter.delete({
        where: { id },
      })

      logger.info('章节删除成功', { userId: req.userId, chapterId: id })
      res.json({ message: 'Chapter deleted successfully' })
    } catch (error) {
      logger.error('删除章节失败', { error, chapterId: req.params.id })
      res.status(500).json({ error: 'Failed to delete chapter' })
    }
  }

  async parseNovel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { novelId, text } = req.body

      const novel = await prisma.novel.findFirst({
        where: {
          id: novelId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!novel) {
        res.status(404).json({ error: 'Novel not found or no permission' })
        return
      }

      // 解析小说文本，自动识别章节
      const chapters = this.parseNovelText(text)

      // 删除现有章节
      await prisma.chapter.deleteMany({
        where: { novelId },
      })

      // 创建新章节
      const createdChapters = []
      for (let i = 0; i < chapters.length; i++) {
        const chapter = await prisma.chapter.create({
          data: {
            novelId,
            title: chapters[i].title,
            content: chapters[i].content,
            order: i + 1,
          },
        })
        createdChapters.push(chapter)
      }

      logger.info('小说解析成功', { userId: req.userId, novelId, chapterCount: createdChapters.length })
      res.status(201).json({ chapters: createdChapters })
    } catch (error) {
      logger.error('解析小说失败', { error, novelId: req.body.novelId })
      res.status(500).json({ error: 'Failed to parse novel' })
    }
  }

  private parseNovelText(text: string): { title: string; content: string }[] {
    // 章节标题正则表达式，匹配常见的章节格式
    const chapterRegex = /^(第[\d一二三四五六七八九十百千]+[章节卷集])(.*?)$/gm
    const chapters: { title: string; content: string }[] = []
    let match
    let lastIndex = 0

    // 查找所有章节标题
    while ((match = chapterRegex.exec(text)) !== null) {
      const startIndex = match.index
      const chapterTitle = match[1] + (match[2] || '')

      // 如果不是第一个章节，处理上一个章节的内容
      if (lastIndex < startIndex) {
        const prevContent = text.substring(lastIndex, startIndex).trim()
        if (prevContent) {
          chapters.push({ title: '前言', content: prevContent })
        }
      }

      // 记录当前章节的开始位置
      lastIndex = chapterRegex.lastIndex

      // 查找下一个章节的开始位置，以确定当前章节的结束位置
      const nextMatch = chapterRegex.exec(text)
      const endIndex = nextMatch ? nextMatch.index : text.length
      chapterRegex.lastIndex = lastIndex // 重置正则表达式的位置

      // 提取当前章节的内容
      const content = text.substring(lastIndex, endIndex).trim()
      chapters.push({ title: chapterTitle, content })

      // 更新最后处理的位置
      lastIndex = endIndex
    }

    // 处理最后一个章节后面的内容
    if (lastIndex < text.length) {
      const content = text.substring(lastIndex).trim()
      if (content) {
        chapters.push({ title: '结尾', content })
      }
    }

    // 如果没有找到章节标题，将整个文本作为一个章节
    if (chapters.length === 0) {
      chapters.push({ title: '正文', content: text.trim() })
    }

    return chapters
  }
}

export const novelController = new NovelController()
