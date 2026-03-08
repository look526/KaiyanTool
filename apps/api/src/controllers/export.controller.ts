import { Request, Response } from 'express';
import { exportService } from '../services/export.service';
import logger from '../lib/logger';

class ExportController {
  async exportProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { projectId } = req.params;

      const buffer = await exportService.exportProject(projectId, req.user_id);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=project-${projectId}-${Date.now()}.zip`);
      res.send(buffer);

      logger.info('Project export successful', { user_id: req.user_id, projectId });
    } catch (error) {
      logger.error('Project export failed', { user_id: req.user_id, projectId: req.params.projectId, error });
      res.status(500).json({ error: 'Failed to export project' });
    }
  }

  async importProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { file } = req;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const project = await exportService.importProject(file.buffer, req.user_id);

      res.json({
        success: true,
        project,
      });
      logger.info('Project import successful', { user_id: req.user_id, projectId: project.id });
    } catch (error) {
      logger.error('Project import failed', { user_id: req.user_id, error });
      res.status(500).json({ error: 'Failed to import project' });
    }
  }
}

export const exportController = new ExportController();
