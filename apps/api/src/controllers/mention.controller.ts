import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MentionController {
  async getMentions(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { q = '' } = req.query;
      const query = q as string;

      // Query characters
      const characters = await prisma.character.findMany({
        where: {
          project_id: projectId,
          name: { contains: query, mode: 'insensitive' },
        },
        take: 5,
      });

      // Query items
      const items = await prisma.item.findMany({
        where: {
          project_id: projectId,
          name: { contains: query, mode: 'insensitive' },
        },
        take: 5,
      });

      // Query scenes
      const scenes = await prisma.scene.findMany({
        where: {
          episode: {
            project_id: projectId,
          },
          OR: [
            { location: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        include: {
          Episode: {
            select: { title: true },
          },
        },
      });

      // Query assets
      const assets = await prisma.asset.findMany({
        where: {
          project_id: projectId,
          type: 'image',
          OR: [
            { metadata: { path: ['name'], string_contains: query } },
            { metadata: { path: ['description'], string_contains: query } },
          ],
        },
        take: 5,
      });

      // Format mentions
      const mentions = [
        ...characters.map(c => ({ 
          id: c.id, 
          type: 'character' as const, 
          name: c.name,
          icon: 'user'
        })),
        ...items.map(i => ({ 
          id: i.id, 
          type: 'item' as const, 
          name: i.name,
          icon: 'box'
        })),
        ...scenes.map(s => ({ 
          id: s.id, 
          type: 'scene' as const, 
          name: `${s.location} (${s.time})`,
          icon: 'film'
        })),
        ...assets.map(a => ({ 
          id: a.id, 
          type: 'asset' as const, 
          name: (a.metadata as any)?.name || a.type,
          icon: 'image'
        })),
      ];

      res.json({ success: true, data: mentions });
    } catch (error) {
      console.error('Error getting mentions:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get mentions' } });
    }
  }
}
