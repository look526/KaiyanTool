import { Router } from 'express';
import { z } from 'zod';
import { novelAnalysisService } from '../services/novel-analysis.service';
import { authMiddleware } from '../middleware/auth.middleware';

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
