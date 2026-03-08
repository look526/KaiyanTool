import { Router } from 'express';
import { versionControlService } from '../services/version-control.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/snapshots', async (req, res) => {
  try {
    const result = await versionControlService.createSnapshot({
      project_id: req.body.project_id,
      name: req.body.name,
      description: req.body.description,
      tags: req.body.tags
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create snapshot' });
  }
});

router.get('/history/:project_id', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await versionControlService.getVersionHistory(
      req.params.project_id,
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

router.get('/version/:version_id', async (req, res) => {
  try {
    const version = await versionControlService.getVersion(req.params.version_id);
    res.json(version);
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Version not found' });
  }
});

router.post('/compare', async (req, res) => {
  try {
    const result = await versionControlService.compareVersions({
      version_id_1: req.body.version_id_1,
      version_id_2: req.body.version_id_2
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to compare versions' });
  }
});

router.post('/revert', async (req, res) => {
  try {
    const result = await versionControlService.revertToVersion({
      version_id: req.body.version_id
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to revert' });
  }
});

router.delete('/version/:version_id', async (req, res) => {
  try {
    const result = await versionControlService.deleteVersion(req.params.version_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete version' });
  }
});

router.post('/version/:version_id/tags', async (req, res) => {
  try {
    const result = await versionControlService.addTag(req.params.version_id, req.body.tag);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add tag' });
  }
});

router.delete('/version/:version_id/tags/:tag', async (req, res) => {
  try {
    const result = await versionControlService.removeTag(req.params.version_id, req.params.tag);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to remove tag' });
  }
});

export default router;
