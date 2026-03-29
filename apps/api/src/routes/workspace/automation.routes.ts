import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { triggerWorkflow, getTemplateDescription, getNodeCount, getWorkflowExecutions } from '../../services/workspace/automation';

const router = Router();

router.use(authMiddleware);

router.post('/trigger', async (req, res) => {
  try {
    const { workspace_id, template_type, params } = req.body;
    if (!workspace_id || !template_type) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT' } });
    }
    const result = await triggerWorkflow(workspace_id, template_type, params || {});
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to trigger workflow:', error);
    res.status(500).json({ success: false, error: { code: 'TRIGGER_ERROR' } });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const templates = [
      { type: 'text-to-image', name: '文字生图', description: getTemplateDescription('text-to-image'), node_count: getNodeCount('text-to-image') },
      { type: 'image-to-image', name: '图生图', description: getTemplateDescription('image-to-image'), node_count: getNodeCount('image-to-image') },
      { type: 'image-to-video', name: '图生视频', description: getTemplateDescription('image-to-video'), node_count: getNodeCount('image-to-video') },
      { type: 'storyboard', name: '分镜制作', description: getTemplateDescription('storyboard'), node_count: getNodeCount('storyboard') },
      { type: 'batch-generate', name: '批量生成', description: getTemplateDescription('batch-generate'), node_count: getNodeCount('batch-generate') },
    ];
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Failed to get templates:', error);
    res.status(500).json({ success: false, error: { code: 'TEMPLATE_ERROR' } });
  }
});

router.get('/executions', async (req, res) => {
  try {
    const { workspace_id, limit } = req.query;
    if (!workspace_id || typeof workspace_id !== 'string') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT' } });
    }
    const executions = await getWorkflowExecutions(workspace_id, Number(limit) || 50);
    res.json({ success: true, data: executions });
  } catch (error) {
    console.error('Failed to get executions:', error);
    res.status(500).json({ success: false, error: { code: 'EXECUTION_ERROR' } });
  }
});

export default router;
