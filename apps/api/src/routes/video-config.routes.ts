import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

const router = Router();

router.use(authMiddleware);

router.get('/configs', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    const where: any = {};
    if (projectId) {
      where.projectId = projectId;
    }

    const configs = await prisma.videoConfig.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(configs);
  } catch (error) {
    logger.error('Failed to get video configs', { error });
    res.status(500).json({ error: 'Failed to get video configs' });
  }
});

router.get('/configs/:id', async (req: Request, res: Response) => {
  try {
    const config = await prisma.videoConfig.findUnique({
      where: { id: req.params.id },
    });

    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }

    res.json(config);
  } catch (error) {
    logger.error('Failed to get video config', { error });
    res.status(500).json({ error: 'Failed to get video config' });
  }
});

router.post('/configs', async (req: Request, res: Response) => {
  try {
    const {
      name,
      projectId,
      model,
      mode,
      duration,
      aspectRatio,
      resolution,
      fps,
      style,
      negativePrompt,
      seed,
      cfgScale,
      motionStrength,
      cameraMovement,
      transitionType,
      startFrameUrl,
      startFramePrompt,
      endFrameUrl,
      endFramePrompt,
      images,
      audioEnabled,
      manufacturer,
      aiConfigId,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Config name is required' });
    }

    const config = await prisma.videoConfig.create({
      data: {
        name,
        projectId: projectId || null,
        model: model || 'default',
        mode: mode || 'text',
        duration: duration || 5,
        aspectRatio: aspectRatio || '16:9',
        resolution: resolution || '1080p',
        fps: fps || 24,
        style: style || null,
        negativePrompt: negativePrompt || null,
        seed: seed || null,
        cfgScale: cfgScale || 7,
        motionStrength: motionStrength || 1,
        cameraMovement: cameraMovement || null,
        transitionType: transitionType || null,
        startFrameUrl: startFrameUrl || null,
        startFramePrompt: startFramePrompt || null,
        endFrameUrl: endFrameUrl || null,
        endFramePrompt: endFramePrompt || null,
        images: images || [],
        audioEnabled: audioEnabled || false,
        manufacturer: manufacturer || null,
        aiConfigId: aiConfigId || null,
      },
    });

    res.status(201).json(config);
  } catch (error) {
    logger.error('Failed to create video config', { error });
    res.status(500).json({ error: 'Failed to create video config' });
  }
});

router.put('/configs/:id', async (req: Request, res: Response) => {
  try {
    const {
      name,
      model,
      mode,
      duration,
      aspectRatio,
      resolution,
      fps,
      style,
      negativePrompt,
      seed,
      cfgScale,
      motionStrength,
      cameraMovement,
      transitionType,
      startFrameUrl,
      startFramePrompt,
      endFrameUrl,
      endFramePrompt,
      images,
      audioEnabled,
      manufacturer,
      aiConfigId,
    } = req.body;

    const config = await prisma.videoConfig.update({
      where: { id: req.params.id },
      data: {
        name,
        model,
        mode,
        duration,
        aspectRatio,
        resolution,
        fps,
        style,
        negativePrompt,
        seed,
        cfgScale,
        motionStrength,
        cameraMovement,
        transitionType,
        startFrameUrl,
        startFramePrompt,
        endFrameUrl,
        endFramePrompt,
        images,
        audioEnabled,
        manufacturer,
        aiConfigId,
      },
    });

    res.json(config);
  } catch (error) {
    logger.error('Failed to update video config', { error });
    res.status(500).json({ error: 'Failed to update video config' });
  }
});

router.delete('/configs/:id', async (req: Request, res: Response) => {
  try {
    await prisma.videoConfig.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete video config', { error });
    res.status(500).json({ error: 'Failed to delete video config' });
  }
});

router.get('/models', async (_req: Request, res: Response) => {
  try {
    const models = [
      {
        id: 'kling-v1',
        name: 'Kling V1',
        provider: 'kling',
        type: 'text-to-video',
        maxDuration: 10,
        resolutions: ['720p', '1080p'],
        aspectRatios: ['16:9', '9:16', '1:1'],
        features: ['image-to-video', 'text-to-video'],
      },
      {
        id: 'kling-v2',
        name: 'Kling V2',
        provider: 'kling',
        type: 'text-to-video',
        maxDuration: 10,
        resolutions: ['720p', '1080p'],
        aspectRatios: ['16:9', '9:16', '1:1'],
        features: ['image-to-video', 'text-to-video', 'motion-brush'],
      },
      {
        id: 'vidu-v1',
        name: 'Vidu V1',
        provider: 'vidu',
        type: 'text-to-video',
        maxDuration: 16,
        resolutions: ['720p', '1080p'],
        aspectRatios: ['16:9', '9:16'],
        features: ['image-to-video', 'text-to-video', 'audio'],
      },
      {
        id: 'wan-v1',
        name: 'Wan V1',
        provider: 'wan',
        type: 'text-to-video',
        maxDuration: 15,
        resolutions: ['720p', '1080p'],
        aspectRatios: ['16:9', '9:16'],
        features: ['image-to-video', 'text-to-video', 'audio'],
      },
      {
        id: 'doubao-v1',
        name: 'Doubao Video',
        provider: 'volcengine',
        type: 'text-to-video',
        maxDuration: 10,
        resolutions: ['720p', '1080p'],
        aspectRatios: ['16:9', '9:16'],
        features: ['image-to-video', 'text-to-video'],
      },
    ];

    res.json(models);
  } catch (error) {
    logger.error('Failed to get video models', { error });
    res.status(500).json({ error: 'Failed to get video models' });
  }
});

router.get('/presets', async (_req: Request, res: Response) => {
  try {
    const presets = [
      {
        id: 'cinematic',
        name: '电影风格',
        config: {
          style: 'cinematic',
          fps: 24,
          cfgScale: 7,
          motionStrength: 0.8,
        },
      },
      {
        id: 'anime',
        name: '动漫风格',
        config: {
          style: 'anime',
          fps: 24,
          cfgScale: 8,
          motionStrength: 1.0,
        },
      },
      {
        id: 'documentary',
        name: '纪录片风格',
        config: {
          style: 'documentary',
          fps: 30,
          cfgScale: 6,
          motionStrength: 0.6,
        },
      },
      {
        id: 'commercial',
        name: '广告风格',
        config: {
          style: 'commercial',
          fps: 30,
          cfgScale: 7,
          motionStrength: 1.2,
        },
      },
      {
        id: 'slow-motion',
        name: '慢动作',
        config: {
          style: 'slow-motion',
          fps: 60,
          cfgScale: 7,
          motionStrength: 0.4,
        },
      },
    ];

    res.json(presets);
  } catch (error) {
    logger.error('Failed to get video presets', { error });
    res.status(500).json({ error: 'Failed to get video presets' });
  }
});

export default router;
