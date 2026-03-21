import { Router } from 'express';
import projectRoutes from '../project.routes';
import authRoutes from '../auth.routes';
import documentRoutes from '../document.routes';
import aiProviderRoutes from '../ai-provider.routes';
import longRunningAgentRoutes from '../long-running-agent.routes';
import { apiRateLimit } from '../../middleware/rate-limit.middleware';

const router = Router();

router.use(apiRateLimit);

router.use('/projects', projectRoutes);
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/ai-providers', aiProviderRoutes);
router.use('/long-running-agent', longRunningAgentRoutes);

export default router;