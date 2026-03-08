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
      where.project_id = projectId;
    }

    const configs = await (prisma as any).videoConfig?.findMany({
      where,
      orderBy: { created_at: 'desc' },
    }) || [];

    res.json(configs);
  } catch (error) {
    logger.error('Failed to get video configs', { error });
    res.status(500).json({ error: 'Failed to get video configs' });
  }
});

router.get('/configs/:id', async (req: Request, res: Response) => {
  try {
    const config = await (prisma as any).videoConfig?.findUnique({
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

    const config = await (prisma as any).videoConfig?.create({
      data: {
        name,
        project_id: projectId || null,
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

    const config = await (prisma as any).videoConfig?.update({
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
    await (prisma as any).videoConfig?.delete({
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
      },
    ];
    res.json(models);
  } catch (error) {
    logger.error('Failed to get video models', { error });
    res.status(500).json({ error: 'Failed to get video models' });
  }
});

export default router;
