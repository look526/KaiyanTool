import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EpisodeController {
  async getEpisodes(req: Request, res: Response): Promise<void> {
    try {
      console.log('[EpisodeController] getEpisodes called, projectId:', req.params.projectId);
      const { projectId } = req.params;
      const { search, sort = 'created_at', order = 'desc' } = req.query;

      const where: any = { project_id: projectId };

      if (search) {
        where.title = { contains: search as string, mode: 'insensitive' };
      }

      console.log('[EpisodeController] Querying episodes with where:', where);
      const episodes = await prisma.episode.findMany({
        where,
        include: {
          Scene: {
            select: { id: true },
          },
          Shot: {
            select: { id: true, status: true },
          },
        },
        orderBy: { [sort as string]: order as 'asc' | 'desc' },
      });
      console.log('[EpisodeController] Episodes found:', episodes.length);

      const episodesWithStats = episodes.map(episode => ({
        ...episode,
        scene_count: episode.Scene.length,
        shot_count: episode.Shot.length,
        generated_count: episode.Shot.filter(s => s.status === 'completed').length,
        pending_count: episode.Shot.filter(s => s.status === 'pending').length,
      }));

      res.json({ success: true, data: episodesWithStats });
    } catch (error) {
      console.error('Error getting episodes:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get episodes' } });
    }
  }

  async getEpisode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const episode = await prisma.episode.findUnique({
        where: { id },
        include: {
          Scene: {
            orderBy: { scene_order: 'asc' },
          },
          Shot: {
            include: {
              ShotAlternative: {
                where: { is_recommended: true },
                select: { id: true, video_url: true },
              },
            },
          },
          Script: true,
        },
      });

      if (!episode) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
        return;
      }

      res.json({ success: true, data: episode });
    } catch (error) {
      console.error('Error getting episode:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get episode' } });
    }
  }

  async createEpisode(req: Request, res: Response): Promise<void> {
    try {
      console.log('[EpisodeController] createEpisode called');
      console.log('[EpisodeController] projectId:', req.params.projectId);
      console.log('[EpisodeController] body:', req.body);
      const { projectId } = req.params;
      const { title, description, script_id } = req.body;

      // Get next episode number
      const maxEpisode = await prisma.episode.findFirst({
        where: { project_id: projectId },
        orderBy: { episode_number: 'desc' },
        select: { episode_number: true },
      });

      const nextEpisodeNumber = (maxEpisode?.episode_number || 0) + 1;
      console.log('[EpisodeController] nextEpisodeNumber:', nextEpisodeNumber);

      const episode = await prisma.episode.create({
        data: {
          project_id: projectId,
          title,
          description,
          script_id,
          episode_number: nextEpisodeNumber,
        },
      });
      console.log('[EpisodeController] episode created:', episode.id);

      res.status(201).json({ success: true, data: episode });
    } catch (error) {
      console.error('[EpisodeController] Error creating episode:', error);
      console.error('[EpisodeController] Error details:', JSON.stringify(error, null, 2));
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create episode' } });
    }
  }

  async updateEpisode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, script_id } = req.body;

      const episode = await prisma.episode.update({
        where: { id },
        data: {
          title,
          description,
          script_id,
        },
      });

      res.json({ success: true, data: episode });
    } catch (error) {
      console.error('Error updating episode:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update episode' } });
    }
  }

  async deleteEpisode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.episode.delete({
        where: { id },
      });

      res.json({ success: true, message: 'Episode deleted successfully' });
    } catch (error) {
      console.error('Error deleting episode:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete episode' } });
    }
  }

  async getEpisodeStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const episode = await prisma.episode.findUnique({
        where: { id },
        include: {
          Scene: {
            select: { id: true, status: true },
          },
          Shot: {
            select: { id: true, status: true },
          },
        },
      });

      if (!episode) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
        return;
      }

      const stats = {
        scene_count: episode.Scene.length,
        shot_count: episode.Shot.length,
        generated_count: episode.Shot.filter(s => s.status === 'completed').length,
        generating_count: episode.Shot.filter(s => s.status === 'generating').length,
        pending_count: episode.Shot.filter(s => s.status === 'pending').length,
      };

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error getting episode stats:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get episode stats' } });
    }
  }
}
