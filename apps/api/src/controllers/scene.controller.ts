import crypto from 'crypto';
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getOrCreateDefaultEpisode } from '../utils/episode-resolver';

export class SceneController {
  async getScenesByProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      // Get all episodes for this project
      const episodes = await prisma.episode.findMany({
        where: { project_id: projectId },
        select: { id: true },
      });

      const episodeIds = episodes.map(ep => ep.id);

      // Get all scenes for these episodes
      const scenes = await prisma.scene.findMany({
        where: { 
          episode_id: { in: episodeIds }
        },
        include: {
          Episode: {
            select: {
              id: true,
              title: true,
            }
          },
          Shot: {
            select: {
              id: true,
              action_summary: true,
              status: true,
              aspect_ratio: true,
              resolution: true,
            },
          },
        },
        orderBy: { scene_order: 'asc' },
      });

      res.json({ success: true, data: scenes });
    } catch (error) {
      console.error('Error getting scenes by project:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get scenes' } });
    }
  }

  async getScenes(req: Request, res: Response): Promise<void> {
    try {
      const { episodeId } = req.params;

      const scenes = await prisma.scene.findMany({
        where: { episode_id: episodeId },
        orderBy: { scene_order: 'asc' },
        include: {
          Shot: {
            select: {
              id: true,
              action_summary: true,
              status: true,
              aspect_ratio: true,
              resolution: true,
            },
          },
        },
      });

      res.json({ success: true, data: scenes });
    } catch (error) {
      console.error('Error getting scenes:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get scenes' } });
    }
  }

  async getScene(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const scene = await prisma.scene.findUnique({
        where: { id },
        include: {
          Shot: {
            orderBy: { created_at: 'asc' },
          },
        },
      });

      if (!scene) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scene not found' } });
        return;
      }

      res.json({ success: true, data: scene });
    } catch (error) {
      console.error('Error getting scene:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get scene' } });
    }
  }

  async createScene(req: Request, res: Response): Promise<void> {
    try {
      const { episodeId, projectId } = req.params;
      const { location, time, description, atmosphere } = req.body;

      if (!episodeId && !projectId) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing episodeId or projectId' } });
        return;
      }

      let targetEpisodeId = episodeId;
      let targetProjectId: string | null = null;

      if (episodeId) {
        const episode = await prisma.episode.findUnique({
          where: { id: episodeId },
          select: {
            id: true,
            project_id: true,
          },
        });

        if (!episode) {
          res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
          return;
        }

        targetEpisodeId = episode.id;
        targetProjectId = episode.project_id;
      } else if (projectId) {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true },
        });

        if (!project) {
          res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
          return;
        }

        const episode = await getOrCreateDefaultEpisode(projectId);
        targetEpisodeId = episode.id;
        targetProjectId = episode.project_id;
      }

      // Get next scene order
      const maxScene = await prisma.scene.findFirst({
        where: { episode_id: targetEpisodeId },
        orderBy: { scene_order: 'desc' },
        select: { scene_order: true },
      });

      const nextSceneOrder = (maxScene?.scene_order || 0) + 1;

      const scene = await prisma.scene.create({
        data: {
          id: crypto.randomUUID(),
          episode_id: targetEpisodeId,
          project_id: targetProjectId,
          location,
          time,
          description: description || atmosphere,
          scene_order: nextSceneOrder,
          updated_at: new Date(),
        },
      });

      res.status(201).json({ success: true, data: scene });
    } catch (error) {
      console.error('Error creating scene:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create scene' } });
    }
  }

  async updateScene(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { location, time, description, status } = req.body;

      const scene = await prisma.scene.update({
        where: { id },
        data: {
          location,
          time,
          description,
          status,
        },
      });

      res.json({ success: true, data: scene });
    } catch (error) {
      console.error('Error updating scene:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update scene' } });
    }
  }

  async deleteScene(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.scene.delete({
        where: { id },
      });

      res.json({ success: true, message: 'Scene deleted successfully' });
    } catch (error) {
      console.error('Error deleting scene:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete scene' } });
    }
  }

  async reorderScenes(req: Request, res: Response): Promise<void> {
    try {
      const { episodeId } = req.params;
      const { scenes } = req.body; // Array of { id: string, scene_order: number }

      const updates = scenes.map((scene: any) =>
        prisma.scene.update({
          where: { id: scene.id },
          data: { scene_order: scene.scene_order },
        })
      );

      await prisma.$transaction(updates);

      const updatedScenes = await prisma.scene.findMany({
        where: { episode_id: episodeId },
        orderBy: { scene_order: 'asc' },
      });

      res.json({ success: true, data: updatedScenes });
    } catch (error) {
      console.error('Error reordering scenes:', error);
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reorder scenes' } });
    }
  }
}
