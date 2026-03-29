import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const MAX_ALTERNATIVES = 10;

export class ShotAlternativeController {
  async getAlternatives(req: Request, res: Response): Promise<void> {
    try {
      const { shotId } = req.params;

      const alternatives = await prisma.shotAlternative.findMany({
        where: { shot_id: shotId },
        orderBy: { created_at: 'desc' },
      });

      res.json({ success: true, data: alternatives });
    } catch (error) {
      console.error('Error getting alternatives:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get alternatives' } });
    }
  }

  async createAlternative(req: Request, res: Response): Promise<void> {
    try {
      const { shotId } = req.params;
      const { video_url, metadata } = req.body;

      // Check alternative count
      const count = await prisma.shotAlternative.count({
        where: { shot_id: shotId },
      });

      if (count >= MAX_ALTERNATIVES) {
        res.status(400).json({ 
          success: false, 
          error: { 
            code: 'MAX_ALTERNATIVES_REACHED', 
            message: `Maximum ${MAX_ALTERNATIVES} alternatives reached. Please delete some before creating new ones.` 
          } 
        });
        return;
      }

      const alternative = await prisma.shotAlternative.create({
        data: {
          id: crypto.randomUUID(),
          shot_id: shotId,
          video_url,
          metadata: metadata || {},
          version: count + 1,
        },
      });

      res.status(201).json({ success: true, data: alternative });
    } catch (error) {
      console.error('Error creating alternative:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create alternative' } });
    }
  }

  async setRecommended(req: Request, res: Response): Promise<void> {
    try {
      const { shotId, id } = req.params;

      // First, unset all recommended for this shot
      await prisma.shotAlternative.updateMany({
        where: { shot_id: shotId, is_recommended: true },
        data: { is_recommended: false },
      });

      // Then set the new recommended
      const alternative = await prisma.shotAlternative.update({
        where: { id },
        data: { is_recommended: true },
      });

      res.json({ success: true, data: alternative });
    } catch (error) {
      console.error('Error setting recommended:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to set recommended alternative' } });
    }
  }

  async deleteAlternative(req: Request, res: Response): Promise<void> {
    try {
      const { shotId, id } = req.params;

      await prisma.shotAlternative.delete({
        where: { 
          id,
          shot_id: shotId,
        },
      });

      res.json({ success: true, message: 'Alternative deleted successfully' });
    } catch (error) {
      console.error('Error deleting alternative:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete alternative' } });
    }
  }
}
