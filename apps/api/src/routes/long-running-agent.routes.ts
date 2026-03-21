import { Router } from 'express';
import { longRunningAgentController } from '../controllers/long-running-agent.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/projects/:project_id/users/:user_id/initialize', authenticate, longRunningAgentController.initializeProject.bind(longRunningAgentController));
router.post('/projects/:project_id/users/:user_id/sessions', authenticate, longRunningAgentController.runCodingSession.bind(longRunningAgentController));
router.get('/projects/:project_id/status', authenticate, longRunningAgentController.getProjectStatus.bind(longRunningAgentController));
router.get('/projects/:project_id/report', authenticate, longRunningAgentController.getProgressReport.bind(longRunningAgentController));
router.get('/projects/:project_id/sessions', authenticate, longRunningAgentController.getRecentSessions.bind(longRunningAgentController));
router.get('/projects/:project_id/features/:feature_id', authenticate, longRunningAgentController.getFeature.bind(longRunningAgentController));
router.patch('/projects/:project_id/features/:feature_id/status', authenticate, longRunningAgentController.updateFeatureStatus.bind(longRunningAgentController));
router.post('/projects/:project_id/resume', authenticate, longRunningAgentController.resumeProject.bind(longRunningAgentController));
router.post('/projects/:project_id/auto', authenticate, longRunningAgentController.runAutoSession.bind(longRunningAgentController));
router.delete('/projects/:project_id', authenticate, longRunningAgentController.deleteProject.bind(longRunningAgentController));

export default router;
