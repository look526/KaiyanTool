import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { imageEnhancementService } from '../services/image-enhancement.service';
import crypto from 'crypto';

const router = Router();

router.post('/super-resolution', async (req, res) => {
  try {
    const { imageId, scale = 2, model = 'realesrgan' } = req.body;

    const image = await prisma.asset.findUnique({
      where: { id: imageId }
    });

    if (!image || image.type !== 'image') {
      return res.status(404).json({ error: 'Image not found' });
    }

    const task = await prisma.renderTask.create({
      data: {
        id: crypto.randomUUID(),
        type: 'super-resolution',
        status: 'pending',
        params: { image_id: imageId, scale, model },
        project_id: image.project_id,
        updated_at: new Date()
      }
    });

    const result = await imageEnhancementService.superResolution(
      image.url,
      scale,
      model
    );

    const enhancedAsset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        type: 'image',
        url: result.url,
        project_id: image.project_id,
        metadata: {
          original_image_id: imageId,
          scale,
          model,
          width: result.width,
          height: result.height,
          thumbnail_url: result.thumbnailUrl || result.url
        },
        updated_at: new Date()
      }
    });

    await prisma.renderTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        params: { ...(typeof task.params === 'object' ? task.params : {}), enhanced_asset_id: enhancedAsset.id } as any,
        updated_at: new Date()
      }
    });

    res.json({ enhancedAsset });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed' });
  }
});

router.post('/inpainting', async (req, res) => {
  try {
    const { imageId, maskPrompt, negativePrompt } = req.body;

    const image = await prisma.asset.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const result = await imageEnhancementService.inpainting(
      image.url,
      maskPrompt,
      negativePrompt
    );

    const inpaintedAsset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        type: 'image',
        url: result.url,
        project_id: image.project_id,
        metadata: {
          original_image_id: imageId,
          mask_prompt: maskPrompt,
          negative_prompt: negativePrompt
        },
        updated_at: new Date()
      }
    });

    res.json({ inpaintedAsset });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed' });
  }
});

router.post('/background-removal', async (req, res) => {
  try {
    const { imageId } = req.body;

    const image = await prisma.asset.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const result = await imageEnhancementService.removeBackground(image.url);

    const resultAsset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        type: 'image',
        url: result.url,
        project_id: image.project_id,
        metadata: {
          original_image_id: imageId,
          type: 'background-removed',
          mask_url: result.maskUrl,
          has_alpha: true
        },
        updated_at: new Date()
      }
    });

    res.json({ asset: resultAsset, maskUrl: result.maskUrl });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed' });
  }
});

router.post('/face-enhancement', async (req, res) => {
  try {
    const { imageId, strength = 1.0 } = req.body;

    const image = await prisma.asset.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const result = await imageEnhancementService.faceEnhancement(image.url, strength);

    const enhancedAsset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        type: 'image',
        url: result.url,
        project_id: image.project_id,
        metadata: {
          original_image_id: imageId,
          type: 'face-enhanced',
          strength
        },
        updated_at: new Date()
      }
    });

    res.json({ enhancedAsset });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed' });
  }
});

router.post('/color-correction', async (req, res) => {
  try {
    const { imageId, brightness, contrast, saturation, temperature, tint } = req.body;

    const image = await prisma.asset.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const result = await imageEnhancementService.colorCorrection(image.url, {
      brightness: brightness ?? 0,
      contrast: contrast ?? 0,
      saturation: saturation ?? 0,
      temperature: temperature ?? 0,
      tint: tint ?? 0
    });

    const correctedAsset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        type: 'image',
        url: result.url,
        project_id: image.project_id,
        metadata: {
          original_image_id: imageId,
          type: 'color-corrected',
          adjustments: { brightness, contrast, saturation, temperature, tint }
        },
        updated_at: new Date()
      }
    });

    res.json({ correctedAsset });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed' });
  }
});

router.post('/style-transfer', async (req, res) => {
  try {
    const { imageId, styleReferenceId, strength = 0.5 } = req.body;

    const [image, styleRef] = await Promise.all([
      prisma.asset.findUnique({ where: { id: imageId } }),
      styleReferenceId ? prisma.asset.findUnique({ where: { id: styleReferenceId } }) : null
    ]);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const result = await imageEnhancementService.styleTransfer(
      image.url,
      styleRef?.url,
      strength
    );

    const styledAsset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        type: 'image',
        url: result.url,
        project_id: image.project_id,
        metadata: {
          original_image_id: imageId,
          type: 'style-transfer',
          style_reference_id: styleReferenceId,
          strength
        },
        updated_at: new Date()
      }
    });

    res.json({ styledAsset });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed' });
  }
});

router.post('/upscale', async (req, res) => {
  try {
    const { imageId, scale = 2, model = 'realesrgan' } = req.body;

    const image = await prisma.asset.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const result = await imageEnhancementService.upscale(image.url, scale, model);

    const upscaledAsset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        type: 'image',
        url: result.url,
        project_id: image.project_id,
        metadata: {
          original_image_id: imageId,
          type: 'upscaled',
          scale,
          model,
          width: result.width,
          height: result.height
        },
        updated_at: new Date()
      }
    });

    res.json({ upscaledAsset });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed' });
  }
});

export default router;
