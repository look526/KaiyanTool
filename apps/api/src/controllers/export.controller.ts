import { Request, Response } from 'express';
import { exportService } from '../services/export.service';
import logger from '../lib/logger';

class ExportController {
  async exportProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { projectId } = req.params;

      const buffer = await exportService.exportProject(projectId, req.userId);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=project-${projectId}-${Date.now()}.zip`);
      res.send(buffer);

      logger.info('Project export successful', { userId: req.userId, projectId });
    } catch (error) {
      logger.error('Project export failed', { userId: req.userId, projectId: req.params.projectId, error });
      res.status(500).json({ error: 'Failed to export project' });
    }
  }

  async importProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { file } = req;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const project = await exportService.importProject(file.buffer, req.userId);

      res.json({
        success: true,
        project,
      });
      logger.info('Project import successful', { userId: req.userId, projectId: project.id });
    } catch (error) {
      logger.error('Project import failed', { userId: req.userId, error });
      res.status(500).json({ error: 'Failed to import project' });
    }
  }
}

export const exportController = new ExportController();
