import { Router } from 'express';
import {
  getWorkspacesByUser,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  createCanvasNode,
  updateCanvasNode,
  deleteCanvasNode,
  getCanvasNodes,
  createCanvasEdge,
  deleteCanvasEdge,
  getCanvasEdges,
  addNodeHistory,
  getNodeHistory,
  updateNodeStar,
  updateNodeLabels,
  exportWorkspace,
  importWorkspace,
} from '../services/workspace.service';
import { authMiddleware } from '../middleware/auth.middleware';
import aiRoutes from './workspace/ai.routes';

const router = Router();

router.use(authMiddleware);

router.use('/ai', aiRoutes);

router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const workspaces = await getWorkspacesByUser(userId);
    res.json({ success: true, data: workspaces });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get workspaces' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const workspace = await createWorkspace({
      user_id: userId,
      name: req.body.name,
      config: req.body.config,
    });
    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create workspace' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const workspace = await getWorkspaceById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get workspace' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const workspace = await updateWorkspace(req.params.id, {
      name: req.body.name,
      config: req.body.config,
      snapshot: req.body.snapshot,
    });
    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update workspace' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteWorkspace(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete workspace' });
  }
});

router.get('/:id/export', async (req, res) => {
  try {
    const data = await exportWorkspace(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to export workspace' });
  }
});

router.post('/:id/import', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const workspace = await importWorkspace(userId, req.body);
    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to import workspace' });
  }
});

router.get('/:id/nodes', async (req, res) => {
  try {
    const nodes = await getCanvasNodes(req.params.id);
    res.json({ success: true, data: nodes });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get nodes' });
  }
});

router.post('/:id/nodes', async (req, res) => {
  try {
    const node = await createCanvasNode({
      workspace_id: req.params.id,
      type: req.body.type,
      position_x: req.body.position_x,
      position_y: req.body.position_y,
      config: req.body.config,
      content: req.body.content,
      output_url: req.body.output_url,
      history: req.body.history,
      labels: req.body.labels,
      is_starred: req.body.is_starred,
    });
    res.json({ success: true, data: node });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create node' });
  }
});

router.patch('/nodes/:nodeId', async (req, res) => {
  try {
    const node = await updateCanvasNode(req.params.nodeId, {
      position_x: req.body.position_x,
      position_y: req.body.position_y,
      config: req.body.config,
      content: req.body.content,
      output_url: req.body.output_url,
      history: req.body.history,
      labels: req.body.labels,
      is_starred: req.body.is_starred,
    });
    res.json({ success: true, data: node });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update node' });
  }
});

router.delete('/nodes/:nodeId', async (req, res) => {
  try {
    await deleteCanvasNode(req.params.nodeId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete node' });
  }
});

router.get('/nodes/:nodeId/history', async (req, res) => {
  try {
    const history = await getNodeHistory(req.params.nodeId);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get node history' });
  }
});

router.post('/nodes/:nodeId/history', async (req, res) => {
  try {
    const history = await addNodeHistory(req.params.nodeId, {
      content: req.body.content,
      output_url: req.body.output_url,
      timestamp: new Date(),
    });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add node history' });
  }
});

router.patch('/nodes/:nodeId/star', async (req, res) => {
  try {
    const node = await updateNodeStar(req.params.nodeId, req.body.is_starred);
    res.json({ success: true, data: node });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update star' });
  }
});

router.patch('/nodes/:nodeId/labels', async (req, res) => {
  try {
    const node = await updateNodeLabels(req.params.nodeId, req.body.labels);
    res.json({ success: true, data: node });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update labels' });
  }
});

router.get('/:id/edges', async (req, res) => {
  try {
    const edges = await getCanvasEdges(req.params.id);
    res.json({ success: true, data: edges });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get edges' });
  }
});

router.post('/:id/edges', async (req, res) => {
  try {
    const edge = await createCanvasEdge({
      workspace_id: req.params.id,
      source_node_id: req.body.source_node_id,
      target_node_id: req.body.target_node_id,
    });
    res.json({ success: true, data: edge });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create edge' });
  }
});

router.delete('/edges/:edgeId', async (req, res) => {
  try {
    await deleteCanvasEdge(req.params.edgeId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete edge' });
  }
});

export default router;