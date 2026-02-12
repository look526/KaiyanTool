import { Router } from 'express';
import { workflowService } from '../services/workflow.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/templates', async (req, res) => {
  try {
    const templates = await workflowService.getTemplates({
      category: req.query.category as string,
      search: req.query.search as string
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const template = await workflowService.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get template' });
  }
});

router.post('/execute', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, templateId, initialData } = req.body;

    const execution = await workflowService.createExecution(
      userId,
      projectId,
      templateId,
      initialData
    );
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create execution' });
  }
});

router.post('/:executionId/start', async (req, res) => {
  try {
    await workflowService.startExecution(req.params.executionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to start execution' });
  }
});

router.post('/:executionId/pause', async (req, res) => {
  try {
    await workflowService.pauseExecution(req.params.executionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to pause execution' });
  }
});

router.post('/:executionId/resume', async (req, res) => {
  try {
    await workflowService.resumeExecution(req.params.executionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to resume execution' });
  }
});

router.post('/:executionId/cancel', async (req, res) => {
  try {
    await workflowService.cancelExecution(req.params.executionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to cancel execution' });
  }
});

router.get('/:executionId', async (req, res) => {
  try {
    const execution = await workflowService.getExecution(req.params.executionId);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get execution' });
  }
});

router.get('/project/:projectId', async (req, res) => {
  try {
    const executions = await workflowService.getProjectExecutions(req.params.projectId);
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get executions' });
  }
});

router.put('/:executionId/data', async (req, res) => {
  try {
    await workflowService.updateExecutionData(req.params.executionId, req.body.data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update data' });
  }
});

export default router;
