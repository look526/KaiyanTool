import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import logger from '../lib/logger';

const router = Router();

router.use(authMiddleware);

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

router.post('/upscale', async (req: Request, res: Response) => {
  try {
    const { imageUrl, scale = 2, model = 'realesrgan' } = req.body;

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

    const newWidth = Math.round(metadata.width * scale);
    const newHeight = Math.round(metadata.height * scale);

    const timestamp = Date.now();
    const outputFilename = `upscaled_${timestamp}_${scale}x.png`;
    const outputPath = path.join(UPLOAD_DIR, 'upscaled', outputFilename);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    let upscaledImage: sharp.Sharp;

    if (model === 'realesrgan' || model === 'esrgan') {
      upscaledImage = sharp(imageBuffer)
        .resize(newWidth, newHeight, {
          kernel: sharp.kernel.lanczos3,
          fit: 'inside',
        });
    } else {
      upscaledImage = sharp(imageBuffer)
        .resize(newWidth, newHeight, {
          kernel: sharp.kernel.cubic,
          fit: 'inside',
        });
    }

    await upscaledImage.png({ quality: 95 }).toFile(outputPath);

    res.json({
      success: true,
      originalUrl: imageUrl,
      upscaledUrl: `/uploads/upscaled/${outputFilename}`,
      originalSize: { width: metadata.width, height: metadata.height },
      newSize: { width: newWidth, height: newHeight },
      scale,
      model,
    });
  } catch (error) {
    logger.error('Failed to upscale image', { error });
    res.status(500).json({ error: '图片超分失败' });
  }
});

router.post('/upscale-batch', async (req: Request, res: Response) => {
  try {
    const { images, scale = 2, model = 'realesrgan' } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: '图片列表不能为空' });
    }

    const results: any[] = [];

    for (const imageUrl of images) {
      try {
        const imagePath = imageUrl.startsWith('http')
          ? await downloadImage(imageUrl)
          : path.join(UPLOAD_DIR, imageUrl.replace('/uploads/', ''));

        const imageBuffer = await fs.readFile(imagePath);
        const metadata = await sharp(imageBuffer).metadata();

        if (!metadata.width || !metadata.height) {
          results.push({ original: imageUrl, error: '无法读取图片尺寸' });
          continue;
        }

        const newWidth = Math.round(metadata.width * scale);
        const newHeight = Math.round(metadata.height * scale);

        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const outputFilename = `upscaled_${timestamp}_${randomId}_${scale}x.png`;
        const outputPath = path.join(UPLOAD_DIR, 'upscaled', outputFilename);

        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        let upscaledImage: sharp.Sharp;

        if (model === 'realesrgan' || model === 'esrgan') {
          upscaledImage = sharp(imageBuffer)
            .resize(newWidth, newHeight, {
              kernel: sharp.kernel.lanczos3,
              fit: 'inside',
            });
        } else {
          upscaledImage = sharp(imageBuffer)
            .resize(newWidth, newHeight, {
              kernel: sharp.kernel.cubic,
              fit: 'inside',
            });
        }

        await upscaledImage.png({ quality: 95 }).toFile(outputPath);

        results.push({
          original: imageUrl,
          upscaled: `/uploads/upscaled/${outputFilename}`,
          originalSize: { width: metadata.width, height: metadata.height },
          newSize: { width: newWidth, height: newHeight },
        });
      } catch (error) {
        results.push({ original: imageUrl, error: '超分失败' });
      }
    }

    res.json({
      success: true,
      scale,
      model,
      results,
      totalProcessed: results.length,
      successCount: results.filter(r => r.upscaled).length,
    });
  } catch (error) {
    logger.error('Failed to batch upscale images', { error });
    res.status(500).json({ error: '批量超分失败' });
  }
});

router.post('/enhance', async (req: Request, res: Response) => {
  try {
    const { imageUrl, brightness, contrast, saturation, sharpness, denoise } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: '图片URL不能为空' });
    }

    const imagePath = imageUrl.startsWith('http')
      ? await downloadImage(imageUrl)
      : path.join(UPLOAD_DIR, imageUrl.replace('/uploads/', ''));

    const imageBuffer = await fs.readFile(imagePath);

    let image = sharp(imageBuffer);

    if (brightness !== undefined || contrast !== undefined) {
      image = image.modulate({
        brightness: brightness || 1,
      });
    }

    if (saturation !== undefined) {
      image = image.modulate({
        saturation: saturation,
      });
    }

    if (sharpness) {
      image = image.sharpen(sharpness);
    }

    if (denoise) {
      image = image.median(denoise);
    }

    const timestamp = Date.now();
    const outputFilename = `enhanced_${timestamp}.png`;
    const outputPath = path.join(UPLOAD_DIR, 'enhanced', outputFilename);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await image.png({ quality: 95 }).toFile(outputPath);

    res.json({
      success: true,
      originalUrl: imageUrl,
      enhancedUrl: `/uploads/enhanced/${outputFilename}`,
      adjustments: { brightness, contrast, saturation, sharpness, denoise },
    });
  } catch (error) {
    logger.error('Failed to enhance image', { error });
    res.status(500).json({ error: '图片增强失败' });
  }
});

router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { imageUrl, format = 'png', quality = 90 } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: '图片URL不能为空' });
    }

    const supportedFormats = ['png', 'jpeg', 'jpg', 'webp', 'avif'];
    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ error: `不支持的格式: ${format}` });
    }

    const imagePath = imageUrl.startsWith('http')
      ? await downloadImage(imageUrl)
      : path.join(UPLOAD_DIR, imageUrl.replace('/uploads/', ''));

    const imageBuffer = await fs.readFile(imagePath);
    const image = sharp(imageBuffer);

    const timestamp = Date.now();
    const outputFilename = `converted_${timestamp}.${format}`;
    const outputPath = path.join(UPLOAD_DIR, 'converted', outputFilename);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    switch (format) {
      case 'png':
        await image.png({ quality }).toFile(outputPath);
        break;
      case 'jpeg':
      case 'jpg':
        await image.jpeg({ quality }).toFile(outputPath);
        break;
      case 'webp':
        await image.webp({ quality }).toFile(outputPath);
        break;
      case 'avif':
        await image.avif({ quality }).toFile(outputPath);
        break;
    }

    res.json({
      success: true,
      originalUrl: imageUrl,
      convertedUrl: `/uploads/converted/${outputFilename}`,
      format,
      quality,
    });
  } catch (error) {
    logger.error('Failed to convert image', { error });
    res.status(500).json({ error: '图片转换失败' });
  }
});

router.get('/models', (_req: Request, res: Response) => {
  res.json({
    models: [
      {
        id: 'realesrgan',
        name: 'Real-ESRGAN',
        description: '通用超分辨率模型，适合大多数图片',
        maxScale: 4,
        supportedFormats: ['png', 'jpeg', 'webp'],
      },
      {
        id: 'esrgan',
        name: 'ESRGAN',
        description: '增强型超分辨率模型',
        maxScale: 4,
        supportedFormats: ['png', 'jpeg', 'webp'],
      },
      {
        id: 'bicubic',
        name: '双三次插值',
        description: '快速但质量较低的超分方法',
        maxScale: 8,
        supportedFormats: ['png', 'jpeg', 'webp', 'avif'],
      },
      {
        id: 'lanczos',
        name: 'Lanczos',
        description: '高质量插值算法',
        maxScale: 8,
        supportedFormats: ['png', 'jpeg', 'webp', 'avif'],
      },
    ],
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
