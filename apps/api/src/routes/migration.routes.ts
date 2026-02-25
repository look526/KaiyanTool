import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { migrationController } from '../controllers/migration.controller';

const router = Router();

router.post('/migrate/bigbanana', authMiddleware, migrationController.migrateFromBigBanana.bind(migrationController));
router.post('/migrate/toonflow', authMiddleware, migrationController.migrateFromToonflow.bind(migrationController));
router.post('/migrate/cinegen', authMiddleware, migrationController.migrateFromCineGen.bind(migrationController));
router.get('/migrate/status', authMiddleware, migrationController.getMigrationStatus.bind(migrationController));
router.get('/migrate/export/bigbanana', authMiddleware, migrationController.exportBigBananaData.bind(migrationController));
router.post('/migrate/validate', authMiddleware, migrationController.validateMigrationData.bind(migrationController));

export default router;
