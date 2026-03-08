import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs/promises'
import * as crypto from 'crypto'
import sharp from 'sharp'
import { ossService } from '../lib/oss'
import logger from '../lib/logger'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

class UploadController {
  constructor() {
    this.ensureUploadDir()
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true })
    } catch (error) {
      logger.error('创建上传目录失败', { error })
    }
  }

  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const file = req.file
      if (!file) {
        res.status(400).json({ error: '没有上传文件' })
        return
      }

      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        res.status(400).json({ error: '不支持的文件类型，仅支持 JPEG、PNG、WebP' })
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        res.status(400).json({ error: '文件大小不能超过 5MB' })
        return
      }

      const timestamp = Date.now()
      const ext = path.extname(file.originalname)
      const filename = `${timestamp}-${Math.random().toString(36).substr(2, 9)}${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)

      const buffer = await sharp(file.buffer)
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer()

      let url: string;
      if (ossService.isEnabled()) {
        url = await ossService.uploadBuffer(buffer, `images/${filename}`, file.mimetype);
      } else {
        await fs.writeFile(filepath, buffer);
        url = `/uploads/${filename}`;
      }

      res.json({ url, filename })
      logger.info('图片上传成功', { userId: req.user_id, filename, size: file.size })
    } catch (error) {
      logger.error('上传失败', { userId: req.user_id, error })
      res.status(500).json({ error: '上传失败' })
    }
  }

  async uploadCharacterImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const file = req.file
      if (!file) {
        res.status(400).json({ error: '没有上传文件' })
        return
      }

      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        res.status(400).json({ error: '不支持的文件类型' })
        return
      }

      const timestamp = Date.now()
      const filename = `char-${timestamp}-${Math.random().toString(36).substr(2, 9)}.webp`
      const filepath = path.join(UPLOAD_DIR, filename)

      const buffer = await sharp(file.buffer)
        .resize({ width: 800, height: 800, fit: 'cover' })
        .webp({ quality: 85 })
        .toBuffer()

      let url: string;
      if (ossService.isEnabled()) {
        url = await ossService.uploadBuffer(buffer, `characters/${filename}`, file.mimetype);
      } else {
        await fs.writeFile(filepath, buffer);
        url = `/uploads/${filename}`;
      }

      res.json({ url, filename })
      logger.info('角色图片上传成功', { userId: req.user_id, filename })
    } catch (error) {
      logger.error('上传失败', { userId: req.user_id, error })
      res.status(500).json({ error: '上传失败' })
    }
  }

  async uploadSceneImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const file = req.file
      if (!file) {
        res.status(400).json({ error: '没有上传文件' })
        return
      }

      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        res.status(400).json({ error: '不支持的文件类型' })
        return
      }

      const timestamp = Date.now()
      const filename = `scene-${timestamp}-${Math.random().toString(36).substr(2, 9)}.webp`
      const filepath = path.join(UPLOAD_DIR, filename)

      const buffer = await sharp(file.buffer)
        .resize({ width: 1920, height: 1080, fit: 'cover' })
        .webp({ quality: 85 })
        .toBuffer()

      let url: string;
      if (ossService.isEnabled()) {
        url = await ossService.uploadBuffer(buffer, `scenes/${filename}`, file.mimetype);
      } else {
        await fs.writeFile(filepath, buffer);
        url = `/uploads/${filename}`;
      }

      res.json({ url, filename })
      logger.info('场景图片上传成功', { userId: req.user_id, filename })
    } catch (error) {
      logger.error('上传失败', { userId: req.user_id, error })
      res.status(500).json({ error: '上传失败' })
    }
  }

  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { filename } = req.params
      const filepath = path.join(UPLOAD_DIR, filename)

      try {
        await fs.unlink(filepath)
      } catch (error) {
        logger.error('删除文件失败', { userId: req.user_id, filename, error })
      }

      res.json({ message: '图片删除成功' })
      logger.info('图片删除成功', { userId: req.user_id, filename })
    } catch (error) {
      logger.error('删除失败', { userId: req.user_id, filename: req.params.filename, error })
      res.status(500).json({ error: '删除失败' })
    }
  }

  async uploadAsset(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const file = req.file
      if (!file) {
        res.status(400).json({ error: '没有上传文件' })
        return
      }

      const { project_id } = req.params
      const { prisma } = await import('../lib/prisma')

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          OR: [
            { owner_id: req.user_id },
            { ProjectMember: { some: { user_id: req.user_id } } },
          ],
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const timestamp = Date.now()
      const ext = path.extname(file.originalname) || '.bin'
      const filename = `asset-${timestamp}-${Math.random().toString(36).substr(2, 9)}${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)

      let url: string
      if (ossService.isEnabled()) {
        url = await ossService.uploadBuffer(file.buffer, `assets/${filename}`, file.mimetype)
      } else {
        await fs.writeFile(filepath, file.buffer)
        url = `/uploads/${filename}`
      }

      const assetType = file.mimetype.startsWith('image/') ? 'image' :
                        file.mimetype.startsWith('video/') ? 'video' :
                        file.mimetype.startsWith('audio/') ? 'audio' : 'document'

      const asset = await prisma.asset.create({
        data: {
          id: crypto.randomUUID(),
          type: assetType,
          url,
          project_id,
          metadata: {
            original_name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      res.json({ asset, url })
      logger.info('资产上传成功', { user_id: req.user_id, project_id, asset_id: asset.id })
    } catch (error) {
      logger.error('资产上传失败', { user_id: req.user_id, error })
      res.status(500).json({ error: '上传失败' })
    }
  }
}

export const uploadController = new UploadController()
