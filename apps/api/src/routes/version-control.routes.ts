import { Router } from 'express';
import { versionControlService } from '../services/version-control.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/snapshots', async (req, res) => {
  try {
    const result = await versionControlService.createSnapshot({
      projectId: req.body.projectId,
      name: req.body.name,
      description: req.body.description,
      tags: req.body.tags
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create snapshot' });
  }
});

router.get('/history/:projectId', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await versionControlService.getVersionHistory(
      req.params.projectId,
      {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get history' });
  }
});

router.get('/version/:versionId', async (req, res) => {
  try {
    const version = await versionControlService.getVersion(req.params.versionId);
    res.json(version);
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Version not found' });
  }
});

router.post('/compare', async (req, res) => {
  try {
    const result = await versionControlService.compareVersions({
      versionId1: req.body.versionId1,
      versionId2: req.body.versionId2
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to compare versions' });
  }
});

router.post('/revert', async (req, res) => {
  try {
    const result = await versionControlService.revertToVersion({
      versionId: req.body.versionId
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to revert' });
  }
});

router.delete('/version/:versionId', async (req, res) => {
  try {
    const result = await versionControlService.deleteVersion(req.params.versionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete version' });
  }
});

router.post('/version/:versionId/tags', async (req, res) => {
  try {
    const result = await versionControlService.addTag(req.params.versionId, req.body.tag);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add tag' });
  }
});

router.delete('/version/:versionId/tags/:tag', async (req, res) => {
  try {
    const result = await versionControlService.removeTag(req.params.versionId, req.params.tag);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to remove tag' });
  }
});

export default router;
