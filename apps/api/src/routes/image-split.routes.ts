import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import logger from '../lib/logger';

const router = Router();

router.use(authMiddleware);

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

interface GridConfig {
  rows: number;
  cols: number;
}

const GRID_PRESETS: Record<string, GridConfig> = {
  '2x2': { rows: 2, cols: 2 },
  '3x3': { rows: 3, cols: 3 },
  '2x3': { rows: 2, cols: 3 },
  '3x2': { rows: 3, cols: 2 },
  '4x4': { rows: 4, cols: 4 },
};

router.post('/split', async (req: Request, res: Response) => {
  try {
    const { imageUrl, gridType = '3x3' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: '图片URL不能为空' });
    }

    const config = GRID_PRESETS[gridType] || GRID_PRESETS['3x3'];

    const imagePath = imageUrl.startsWith('http')
      ? await downloadImage(imageUrl)
      : path.join(UPLOAD_DIR, imageUrl.replace('/uploads/', ''));

    const imageBuffer = await fs.readFile(imagePath);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return res.status(400).json({ error: '无法读取图片尺寸' });
    }

    const cellWidth = Math.floor(metadata.width / config.cols);
    const cellHeight = Math.floor(metadata.height / config.rows);

    const cells: string[] = [];
    const timestamp = Date.now();

    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        const left = col * cellWidth;
        const top = row * cellHeight;

        const cellFilename = `split_${timestamp}_${row}_${col}.png`;
        const cellPath = path.join(UPLOAD_DIR, 'splits', cellFilename);

        await fs.mkdir(path.dirname(cellPath), { recursive: true });

        await image
          .clone()
          .extract({ left, top, width: cellWidth, height: cellHeight })
          .toFile(cellPath);

        cells.push(`/uploads/splits/${cellFilename}`);
      }
    }

    res.json({
      success: true,
      gridType,
      originalSize: { width: metadata.width, height: metadata.height },
      cellSize: { width: cellWidth, height: cellHeight },
      cells,
      totalCells: cells.length,
    });
  } catch (error) {
    logger.error('Failed to split image', { error });
    res.status(500).json({ error: '图片分割失败' });
  }
});

router.post('/split-batch', async (req: Request, res: Response) => {
  try {
    const { images, gridType = '3x3' } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: '图片列表不能为空' });
    }

    const config = GRID_PRESETS[gridType] || GRID_PRESETS['3x3'];
    const results: any[] = [];

    for (const imageUrl of images) {
      try {
        const imagePath = imageUrl.startsWith('http')
          ? await downloadImage(imageUrl)
          : path.join(UPLOAD_DIR, imageUrl.replace('/uploads/', ''));

        const imageBuffer = await fs.readFile(imagePath);
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) {
          results.push({ original: imageUrl, error: '无法读取图片尺寸' });
          continue;
        }

        const cellWidth = Math.floor(metadata.width / config.cols);
        const cellHeight = Math.floor(metadata.height / config.rows);

        const cells: string[] = [];
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);

        for (let row = 0; row < config.rows; row++) {
          for (let col = 0; col < config.cols; col++) {
            const left = col * cellWidth;
            const top = row * cellHeight;

            const cellFilename = `split_${timestamp}_${randomId}_${row}_${col}.png`;
            const cellPath = path.join(UPLOAD_DIR, 'splits', cellFilename);

            await fs.mkdir(path.dirname(cellPath), { recursive: true });

            await image
              .clone()
              .extract({ left, top, width: cellWidth, height: cellHeight })
              .toFile(cellPath);

            cells.push(`/uploads/splits/${cellFilename}`);
          }
        }

        results.push({
          original: imageUrl,
          cells,
          cellSize: { width: cellWidth, height: cellHeight },
        });
      } catch (error) {
        results.push({ original: imageUrl, error: '分割失败' });
      }
    }

    res.json({
      success: true,
      gridType,
      results,
      totalProcessed: results.length,
    });
  } catch (error) {
    logger.error('Failed to batch split images', { error });
    res.status(500).json({ error: '批量分割失败' });
  }
});

router.post('/detect-grid', async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: '图片URL不能为空' });
    }

    const imagePath = imageUrl.startsWith('http')
      ? await downloadImage(imageUrl)
      : path.join(UPLOAD_DIR, imageUrl.replace('/uploads/', ''));

    const imageBuffer = await fs.readFile(imagePath);
    const metadata = await sharp(imageBuffer).metadata();

    if (!metadata.width || !metadata.height) {
      return res.status(400).json({ error: '无法读取图片尺寸' });
    }

    const aspectRatio = metadata.width / metadata.height;

    let detectedGrid = '3x3';
    if (aspectRatio > 1.4) {
      detectedGrid = '3x2';
    } else if (aspectRatio < 0.7) {
      detectedGrid = '2x3';
    } else if (aspectRatio > 0.9 && aspectRatio < 1.1) {
      detectedGrid = '2x2';
    }

    const config = GRID_PRESETS[detectedGrid];

    res.json({
      success: true,
      imageSize: { width: metadata.width, height: metadata.height },
      aspectRatio: Math.round(aspectRatio * 100) / 100,
      detectedGrid,
      cellCount: config.rows * config.cols,
      suggestions: Object.keys(GRID_PRESETS),
    });
  } catch (error) {
    logger.error('Failed to detect grid', { error });
    res.status(500).json({ error: '网格检测失败' });
  }
});

router.get('/presets', (_req: Request, res: Response) => {
  res.json({
    presets: Object.entries(GRID_PRESETS).map(([name, config]) => ({
      name,
      rows: config.rows,
      cols: config.cols,
      totalCells: config.rows * config.cols,
    })),
  });
});

async function downloadImage(url: string): Promise<string> {
  const axios = (await import('axios')).default;
  const response = await axios.get(url, { responseType: 'arraybuffer' });

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const filename = `download_${timestamp}_${randomId}.png`;
  const filePath = path.join(UPLOAD_DIR, 'downloads', filename);

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, response.data);

  return filePath;
}

export default router;
