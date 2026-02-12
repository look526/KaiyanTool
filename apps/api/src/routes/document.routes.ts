import express from 'express';
import documentController from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// 应用认证中间件
router.use(authMiddleware);

// 文档路由
router.get('/documents', documentController.getDocuments);
router.get('/documents/:id', documentController.getDocument);
router.post('/documents', documentController.createDocument);
router.put('/documents/:id', documentController.updateDocument);
router.delete('/documents/:id', documentController.deleteDocument);

export default router;