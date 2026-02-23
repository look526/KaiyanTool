import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';
import documentController from '../controllers/document.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// 项目文档相关路由（向后兼容）
router.get('/:projectId/documents', async (req, res) => {
  req.query.projectId = req.params.projectId;
  await documentController.getDocuments(req, res);
});
router.post('/:projectId/documents', async (req, res) => {
  req.body.projectId = req.params.projectId;
  await documentController.createDocument(req, res);
});

export default router;
