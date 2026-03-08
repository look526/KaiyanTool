import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { clothingVariantService } from '../services/clothing-variant.service';
import { authMiddleware } from '../middleware/auth.middleware';
import crypto from 'crypto';

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
      variants.map((variant: string, _index: number) =>
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
          id: crypto.randomUUID(),
          type: 'image',
          url: tasks[i].url,
          project_id: character.project_id,
          metadata: {
            character_id: characterId,
            variant: variants[i],
            base_image_url: baseImageUrl,
            type: 'clothing-variant'
          } as any,
          updated_at: new Date()
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
          path: ['character_id'],
          equals: req.params.characterId
        }
      }
    });

    res.json(variants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get variants' });
  }
});

router.post('/wardrobe', async (_req, res) => {
  res.status(501).json({ error: 'Wardrobe feature not implemented' });
});

router.get('/wardrobe/:characterId', async (_req, res) => {
  res.status(501).json({ error: 'Wardrobe feature not implemented' });
});

router.post('/apply', async (_req, res) => {
  res.status(501).json({ error: 'Wardrobe feature not implemented' });
});

export default router;
