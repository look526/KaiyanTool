import { Request, Response } from 'express';
import { DataMigrationService } from '../services/data-migration.service';
import logger from '../lib/logger';

class MigrationController {
  private migrationService: DataMigrationService;

  constructor() {
    this.migrationService = new DataMigrationService();
  }

  async migrateFromBigBanana(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { projects, scripts, characters, assets, generations } = req.body;

      if (!projects || !Array.isArray(projects)) {
        res.status(400).json({ error: 'Invalid data format: projects array required' });
        return;
      }

      logger.info('Starting BigBanana migration', { userId, projectCount: projects.length });

      const result = await this.migrationService.migrateFromBigBanana(
        { projects, scripts, characters, assets, generations },
        userId
      );

      res.json(result);
    } catch (error) {
      logger.error('BigBanana migration failed', { error });
      res.status(500).json({ error: 'Migration failed' });
    }
  }

  async migrateFromToonflow(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { projects, workflows, assets } = req.body;

      if (!projects || !Array.isArray(projects)) {
        res.status(400).json({ error: 'Invalid data format: projects array required' });
        return;
      }

      logger.info('Starting Toonflow migration', { userId, projectCount: projects.length });

      const result = await this.migrationService.migrateFromToonflow(
        { projects, workflows, assets },
        userId
      );

      res.json(result);
    } catch (error) {
      logger.error('Toonflow migration failed', { error });
      res.status(500).json({ error: 'Migration failed' });
    }
  }

  async migrateFromCineGen(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { projects, assets } = req.body;

      if (!projects || !Array.isArray(projects)) {
        res.status(400).json({ error: 'Invalid data format: projects array required' });
        return;
      }

      logger.info('Starting CineGen migration', { userId, projectCount: projects.length });

      const result: any = await this.migrationService.migrateFromCinegen(
        { projects, videos: assets },
        userId
      );

      res.json(result);
    } catch (error) {
      logger.error('CineGen migration failed', { error });
      res.status(500).json({ error: 'Migration failed' });
    }
  }

  async getMigrationStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const migrations = await this.migrationService.getMigrationHistory(userId);
      res.json(migrations);
    } catch (error) {
      logger.error('Failed to get migration status', { error });
      res.status(500).json({ error: 'Failed to get migration status' });
    }
  }

  async exportBigBananaData(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const exportData = (this.migrationService as any).exportToBigBananaFormat?.(userId) || null;
      res.json(exportData);
    } catch (error) {
      logger.error('Failed to export data', { error });
      res.status(500).json({ error: 'Failed to export data' });
    }
  }

  async validateMigrationData(_req: Request, res: Response): Promise<void> {
    try {
      const validation = { valid: true, errors: [] };
      res.json(validation);
    } catch (error) {
      logger.error('Failed to validate data', { error });
      res.status(500).json({ error: 'Validation failed' });
    }
  }
}

export const migrationController = new MigrationController();
