import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import fs from 'fs/promises';
import path from 'path';
import logger from '../lib/logger';

const router = Router();

router.use(authMiddleware);

const LOG_DIR = path.join(process.cwd(), 'logs');

router.get('/list', async (req: Request, res: Response) => {
  try {
    const files = await fs.readdir(LOG_DIR);
    const logFiles = files.filter(f => f.endsWith('.log'));

    const fileDetails = await Promise.all(
      logFiles.map(async (file) => {
        const filePath = path.join(LOG_DIR, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      })
    );

    res.json({ files: fileDetails });
  } catch (error) {
    logger.error('Failed to list log files', { error });
    res.json({ files: [] });
  }
});

router.get('/read/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const { lines = '100', level, search } = req.query;

    if (!filename.endsWith('.log')) {
      return res.status(400).json({ error: 'Invalid log file' });
    }

    const filePath = path.join(LOG_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');

    let logLines = content.split('\n').filter(l => l.trim());

    if (level && typeof level === 'string') {
      logLines = logLines.filter(l => l.toLowerCase().includes(level.toLowerCase()));
    }

    if (search && typeof search === 'string') {
      logLines = logLines.filter(l => l.toLowerCase().includes(search.toLowerCase()));
    }

    const lineCount = parseInt(lines as string) || 100;
    const recentLines = logLines.slice(-lineCount);

    res.json({
      filename,
      totalLines: logLines.length,
      showingLines: recentLines.length,
      lines: recentLines,
    });
  } catch (error) {
    logger.error('Failed to read log file', { error });
    res.status(500).json({ error: 'Failed to read log file' });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const files = await fs.readdir(LOG_DIR);
    const logFiles = files.filter(f => f.endsWith('.log'));

    let totalSize = 0;
    let totalLines = 0;
    const levelCounts: Record<string, number> = {
      error: 0,
      warn: 0,
      info: 0,
      debug: 0,
    };

    for (const file of logFiles) {
      const filePath = path.join(LOG_DIR, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;

      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());
      totalLines += lines.length;

      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('error')) levelCounts.error++;
        else if (lowerLine.includes('warn')) levelCounts.warn++;
        else if (lowerLine.includes('info')) levelCounts.info++;
        else if (lowerLine.includes('debug')) levelCounts.debug++;
      });
    }

    res.json({
      totalFiles: logFiles.length,
      totalSize,
      totalLines,
      levelCounts,
    });
  } catch (error) {
    logger.error('Failed to get log stats', { error });
    res.json({
      totalFiles: 0,
      totalSize: 0,
      totalLines: 0,
      levelCounts: { error: 0, warn: 0, info: 0, debug: 0 },
    });
  }
});

router.delete('/clear/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    if (!filename.endsWith('.log')) {
      return res.status(400).json({ error: 'Invalid log file' });
    }

    const filePath = path.join(LOG_DIR, filename);
    await fs.writeFile(filePath, '');

    res.json({ success: true, message: `Log file ${filename} cleared` });
  } catch (error) {
    logger.error('Failed to clear log file', { error });
    res.status(500).json({ error: 'Failed to clear log file' });
  }
});

router.get('/recent', async (req: Request, res: Response) => {
  try {
    const { level, limit = '50' } = req.query;

    const today = new Date().toISOString().split('T')[0];
    const filename = `application-${today}.log`;
    const filePath = path.join(LOG_DIR, filename);

    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      const files = await fs.readdir(LOG_DIR);
      const logFiles = files.filter(f => f.endsWith('.log')).sort().reverse();
      if (logFiles.length > 0) {
        content = await fs.readFile(path.join(LOG_DIR, logFiles[0]), 'utf-8');
      }
    }

    let logLines = content.split('\n').filter(l => l.trim());

    if (level && typeof level === 'string') {
      logLines = logLines.filter(l => l.toLowerCase().includes(level.toLowerCase()));
    }

    const limitCount = parseInt(limit as string) || 50;
    const recentLines = logLines.slice(-limitCount);

    res.json({
      logs: recentLines,
      count: recentLines.length,
    });
  } catch (error) {
    logger.error('Failed to get recent logs', { error });
    res.json({ logs: [], count: 0 });
  }
});

router.get('/errors', async (req: Request, res: Response) => {
  try {
    const { limit = '20' } = req.query;

    const files = await fs.readdir(LOG_DIR);
    const logFiles = files.filter(f => f.endsWith('.log')).sort().reverse();

    const errors: string[] = [];
    const limitCount = parseInt(limit as string) || 20;

    for (const file of logFiles) {
      if (errors.length >= limitCount) break;

      const filePath = path.join(LOG_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());

      const errorLines = lines.filter(l => l.toLowerCase().includes('error'));
      errors.push(...errorLines.reverse());
    }

    res.json({
      errors: errors.slice(0, limitCount),
      count: Math.min(errors.length, limitCount),
    });
  } catch (error) {
    logger.error('Failed to get error logs', { error });
    res.json({ errors: [], count: 0 });
  }
});

export default router;
