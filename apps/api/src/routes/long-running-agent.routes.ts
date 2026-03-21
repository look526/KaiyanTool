import { Router } from 'express';
import { longRunningAgentController } from '../controllers/long-running-agent.controller';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const demoAuthMiddleware = (req: AuthRequest, res: any, next: any) => {
  req.user_id = 'demo-user-001';
  req.user = { id: 'demo-user-001', email: 'demo@example.com', name: 'Demo User' };
  next();
};

router.post('/projects/:project_id/users/:user_id/initialize', demoAuthMiddleware, function(req, res) { longRunningAgentController.initializeProject(req, res); });
router.post('/projects/:project_id/users/:user_id/sessions', demoAuthMiddleware, function(req, res) { longRunningAgentController.runCodingSession(req, res); });
router.get('/projects/:project_id/status', demoAuthMiddleware, function(req, res) { longRunningAgentController.getProjectStatus(req, res); });
router.get('/projects/:project_id/report', demoAuthMiddleware, function(req, res) { longRunningAgentController.getProgressReport(req, res); });
router.get('/projects/:project_id/sessions', demoAuthMiddleware, function(req, res) { longRunningAgentController.getRecentSessions(req, res); });
router.get('/projects/:project_id/features/:feature_id', demoAuthMiddleware, function(req, res) { longRunningAgentController.getFeature(req, res); });
router.patch('/projects/:project_id/features/:feature_id/status', demoAuthMiddleware, function(req, res) { longRunningAgentController.updateFeatureStatus(req, res); });
router.post('/projects/:project_id/resume', demoAuthMiddleware, function(req, res) { longRunningAgentController.resumeProject(req, res); });
router.post('/projects/:project_id/auto', demoAuthMiddleware, function(req, res) { longRunningAgentController.runAutoSession(req, res); });
router.delete('/projects/:project_id', demoAuthMiddleware, function(req, res) { longRunningAgentController.deleteProject(req, res); });

export default router;
