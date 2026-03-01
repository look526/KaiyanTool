import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import assetsRoutes from './assets.routes';
import logsRoutes from './logs.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/assets', assetsRoutes);
router.use('/logs', logsRoutes);

export default router;
