import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import logger from '../lib/logger';

const router = Router();

router.use(authMiddleware);

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-32ch';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const settings = project.settings as any || {};

    res.json({
      projectId,
      settings: {
        imageModel: settings.imageModel || null,
        languageModel: settings.languageModel || null,
        videoModel: settings.videoModel || null,
        hasTokenKey: !!settings.tokenKey,
        defaultStyle: settings.defaultStyle || null,
        defaultAspectRatio: settings.defaultAspectRatio || '16:9',
        defaultResolution: settings.defaultResolution || '1080p',
      },
    });
  } catch (error) {
    logger.error('Failed to get project settings', { error });
    res.status(500).json({ error: 'Failed to get project settings' });
  }
});

router.put('/:projectId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;
    const {
      imageModel,
      languageModel,
      videoModel,
      defaultStyle,
      defaultAspectRatio,
      defaultResolution,
    } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or not owner' });
    }

    const currentSettings = (project.settings as any) || {};

    const updatedSettings = {
      ...currentSettings,
      imageModel: imageModel ?? currentSettings.imageModel,
      languageModel: languageModel ?? currentSettings.languageModel,
      videoModel: videoModel ?? currentSettings.videoModel,
      defaultStyle: defaultStyle ?? currentSettings.defaultStyle,
      defaultAspectRatio: defaultAspectRatio ?? currentSettings.defaultAspectRatio,
      defaultResolution: defaultResolution ?? currentSettings.defaultResolution,
    };

    await prisma.project.update({
      where: { id: projectId },
      data: { settings: updatedSettings },
    });

    res.json({
      success: true,
      settings: {
        imageModel: updatedSettings.imageModel,
        languageModel: updatedSettings.languageModel,
        videoModel: updatedSettings.videoModel,
        defaultStyle: updatedSettings.defaultStyle,
        defaultAspectRatio: updatedSettings.defaultAspectRatio,
        defaultResolution: updatedSettings.defaultResolution,
      },
    });
  } catch (error) {
    logger.error('Failed to update project settings', { error });
    res.status(500).json({ error: 'Failed to update project settings' });
  }
});

router.post('/:projectId/token-key', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;
    const { tokenKey } = req.body;

    if (!tokenKey) {
      return res.status(400).json({ error: 'tokenKey is required' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or not owner' });
    }

    const encryptedTokenKey = encrypt(tokenKey);

    const currentSettings = (project.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      tokenKey: encryptedTokenKey,
    };

    await prisma.project.update({
      where: { id: projectId },
      data: { settings: updatedSettings },
    });

    res.json({
      success: true,
      message: 'Token key saved successfully',
    });
  } catch (error) {
    logger.error('Failed to save token key', { error });
    res.status(500).json({ error: 'Failed to save token key' });
  }
});

router.get('/:projectId/token-key', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or not owner' });
    }

    const settings = (project.settings as any) || {};

    if (!settings.tokenKey) {
      return res.json({ tokenKey: null });
    }

    const decryptedTokenKey = decrypt(settings.tokenKey);

    res.json({ tokenKey: decryptedTokenKey });
  } catch (error) {
    logger.error('Failed to get token key', { error });
    res.status(500).json({ error: 'Failed to get token key' });
  }
});

router.delete('/:projectId/token-key', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or not owner' });
    }

    const currentSettings = (project.settings as any) || {};
    delete currentSettings.tokenKey;

    await prisma.project.update({
      where: { id: projectId },
      data: { settings: currentSettings },
    });

    res.json({ success: true, message: 'Token key deleted' });
  } catch (error) {
    logger.error('Failed to delete token key', { error });
    res.status(500).json({ error: 'Failed to delete token key' });
  }
});

router.post('/:projectId/generate-token-key', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or not owner' });
    }

    const tokenKey = crypto.randomBytes(32).toString('hex');
    const encryptedTokenKey = encrypt(tokenKey);

    const currentSettings = (project.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      tokenKey: encryptedTokenKey,
    };

    await prisma.project.update({
      where: { id: projectId },
      data: { settings: updatedSettings },
    });

    res.json({
      success: true,
      tokenKey,
      message: 'Token key generated and saved successfully',
    });
  } catch (error) {
    logger.error('Failed to generate token key', { error });
    res.status(500).json({ error: 'Failed to generate token key' });
  }
});

export default router;
