import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

class DocumentController {
  // 获取文档列表
  async getDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      
      const documents = await prisma.document.findMany({
        where: projectId ? { projectId: projectId as string } : {},
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        documents: documents,
      });
    } catch (error) {
      logger.error('Error getting documents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get documents',
      });
    }
  }

  // 获取单个文档
  async getDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Document not found',
        });
        return;
      }

      res.status(200).json(document);
    } catch (error) {
      logger.error('Error getting document:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get document',
      });
    }
  }

  // 创建文档
  async createDocument(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, title, content, type = 'general', status = 'draft' } = req.body;

      if (!projectId || !title || !content) {
        res.status(400).json({
          success: false,
          error: 'Project ID, title, and content are required',
        });
        return;
      }

      const document = await prisma.document.create({
        data: {
          projectId,
          title,
          content,
          type,
          status,
        },
      });

      res.status(201).json(document);
    } catch (error) {
      logger.error('Error creating document:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create document',
      });
    }
  }

  // 更新文档
  async updateDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content, type, status } = req.body;

      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Document not found',
        });
        return;
      }

      const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
          title: title || document.title,
          content: content || document.content,
          type: type || document.type,
          status: status || document.status,
        },
      });

      res.status(200).json({
        success: true,
        data: updatedDocument,
      });
    } catch (error) {
      logger.error('Error updating document:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update document',
      });
    }
  }

  // 删除文档
  async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Document not found',
        });
        return;
      }

      await prisma.document.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting document:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete document',
      });
    }
  }
}

export default new DocumentController();