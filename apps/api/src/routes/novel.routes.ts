import { Router } from 'express';
import { z } from 'zod';
import { novelAnalysisService } from '../services/novel-analysis.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { storylineAgent } from '../agents/storyline-agent';
import { outlineAgent } from '../agents/outline-agent';

const router = Router();

router.use(authMiddleware);

const NovelAnalysisSchema = z.object({
  title: z.string(),
  author: z.string(),
  content: z.string(),
  genre: z.string().optional(),
  style: z.string().optional()
});

router.post('/analyze', async (req, res) => {
  try {
    const result = await novelAnalysisService.analyzeNovel(
      NovelAnalysisSchema.parse(req.body)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Analysis failed' });
  }
});

router.post('/extract-chapters', async (req, res) => {
  try {
    const chapters = await novelAnalysisService.extractChapters(req.body.content);
    res.json({ chapters });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Extraction failed' });
  }
});

router.post('/identify-characters', async (req, res) => {
  try {
    const characters = await novelAnalysisService.identifyCharacters(req.body.content);
    res.json({ characters });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Identification failed' });
  }
});

router.post('/generate-scenes', async (req, res) => {
  try {
    const scenes = await novelAnalysisService.generateScenesFromChapter(
      req.body.chapterContent,
      req.body.chapterNumber
    );
    res.json({ scenes });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.post('/generate-storyline', async (req, res) => {
  try {
    const description = req.body.description || req.body.content;
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: '故事描述不能为空' });
    }

    const result = await storylineAgent.generateStoryline({
      title: req.body.title || '未命名故事',
      genre: req.body.genre || 'drama',
      description,
      style: req.body.style,
      targetDuration: req.body.targetDuration,
      targetAudience: req.body.targetAudience,
      tone: req.body.tone,
    }, req.user_id, req.body.model);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Storyline generation failed' });
  }
});

router.post('/generate-outline', async (req, res) => {
  try {
    if (!req.body.storylineId) {
      return res.status(400).json({ error: 'storylineId is required' });
    }

    const result = await outlineAgent.generateOutline({
      storylineId: req.body.storylineId,
      title: req.body.title || '未命名大纲',
      genre: req.body.genre || 'drama',
      targetDuration: req.body.targetDuration || 15,
      style: req.body.style,
      additionalNotes: req.body.additionalNotes,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Outline generation failed' });
  }
});

router.post('/adapt-to-script', async (req, res) => {
  try {
    const result = await novelAnalysisService.adaptToScript(
      req.body.novelAnalysis,
      req.body.options
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Adaptation failed' });
  }
});

router.post('/save', async (req, res) => {
  try {
    const documentId = await novelAnalysisService.saveNovelAnalysis(
      req.body.projectId,
      req.body.analysis
    );
    res.json({ id: documentId });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Save failed' });
  }
});

router.post('/import', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = req.file.originalname.split('.').pop()?.toLowerCase() || 'txt';
    const content = req.file.buffer.toString('utf-8');

    const documentId = await novelAnalysisService.importFromFile(
      req.body.projectId,
      content,
      fileType
    );

    res.json({ id: documentId });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Import failed' });
  }
});

export default router;
