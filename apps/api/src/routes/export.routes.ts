import { Router } from 'express';
import { exportController } from '../controllers/export.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authMiddleware);

router.get('/projects/:projectId/export', exportController.exportProject.bind(exportController));
router.post('/import', upload.single('file'), exportController.importProject.bind(exportController));

export default router;
