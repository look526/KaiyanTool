import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { clothingVariantService } from '../services/clothing-variant.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/generate', async (req, res) => {
  try {
    const { characterId, baseImageUrl, variants, style } = req.body;

    const character = await prisma.character.findUnique({
      where: { id: characterId }
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const tasks = await Promise.all(
      variants.map((variant: string, index: number) =>
        clothingVariantService.generateVariant(
          baseImageUrl,
          variant,
          character.appearance as any,
          style
        )
      )
    );

    for (let i = 0; i < tasks.length; i++) {
      await prisma.asset.create({
        data: {
          type: 'image',
          url: tasks[i].url,
          projectId: character.projectId,
          metadata: {
            characterId,
            variant: variants[i],
            baseImageUrl,
            type: 'clothing-variant'
          } as any
        }
      });
    }

    res.json({ variants: tasks });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.get('/character/:characterId', async (req, res) => {
  try {
    const variants = await prisma.asset.findMany({
      where: {
        metadata: {
          path: ['characterId'],
          equals: req.params.characterId
        }
      }
    });

    res.json(variants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get variants' });
  }
});

router.post('/wardrobe', async (req, res) => {
  try {
    const { characterId, name, variants, thumbnailUrl } = req.body;

    const wardrobe = await prisma.clothingWardrobe.create({
      data: {
        characterId,
        name,
        variants,
        thumbnailUrl
      }
    });

    res.json(wardrobe);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create wardrobe' });
  }
});

router.get('/wardrobe/:characterId', async (req, res) => {
  try {
    const wardrobes = await prisma.clothingWardrobe.findMany({
      where: { characterId: req.params.characterId }
    });

    res.json(wardrobes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get wardrobes' });
  }
});

router.post('/apply', async (req, res) => {
  try {
    const { shotId, wardrobeId, variantIndex } = req.body;

    const wardrobe = await prisma.clothingWardrobe.findUnique({
      where: { id: wardrobeId }
    });

    if (!wardrobe) {
      return res.status(404).json({ error: 'Wardrobe not found' });
    }

    const variantUrl = wardrobe.variants[variantIndex];

    await prisma.shot.update({
      where: { id: shotId },
      data: {
        metadata: {
          clothingVariant: variantUrl,
          wardrobeId,
          variantIndex
        } as any
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to apply variant' });
  }
});

export default router;
