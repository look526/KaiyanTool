import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ShotDraftController {
  async getDrafts(req: Request, res: Response): Promise<void> {
    try {
      const { episodeId } = req.params;

      const drafts = await prisma.shotDraft.findMany({
        where: { episode_id: episodeId },
        orderBy: { updated_at: 'desc' },
        include: {
          Shot: {
            select: {
              id: true,
              shot_number: true,
              description: true,
            },
          },
        },
      });

      res.json({ success: true, data: drafts });
    } catch (error) {
      console.error('Error getting drafts:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get drafts' } });
    }
  }

  async saveDraft(req: Request, res: Response): Promise<void> {
    try {
      const { episodeId } = req.params;
      const { shot_id, scene_id, draft_data } = req.body;

      const draft = await prisma.shotDraft.create({
        data: {
          episode_id: episodeId,
          shot_id,
          scene_id,
          draft_data,
        },
      });

      res.status(201).json({ success: true, data: draft });
    } catch (error) {
      console.error('Error saving draft:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to save draft' } });
    }
  }

  async updateDraft(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { draft_data } = req.body;

      const draft = await prisma.shotDraft.update({
        where: { id },
        data: {
          draft_data,
        },
      });

      res.json({ success: true, data: draft });
    } catch (error) {
      console.error('Error updating draft:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update draft' } });
    }
  }

  async deleteDraft(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.shotDraft.delete({
        where: { id },
      });

      res.json({ success: true, message: 'Draft deleted successfully' });
    } catch (error) {
      console.error('Error deleting draft:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete draft' } });
    }
  }
}
