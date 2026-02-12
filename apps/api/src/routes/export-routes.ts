import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { premiereExportService } from '../services/premiere-export.service';
import { authMiddleware } from '../middleware/auth.middleware';

const ExportSchema = z.object({
  projectId: z.string(),
  format: z.enum(['prproj', 'aep', 'edl', 'xml']),
  resolution: z.enum(['720p', '1080p', '4k']),
  frameRate: z.enum([24, 25, 30, 60]),
  includeAudio: z.boolean().optional().default(true),
  includeMarkers: z.boolean().optional().default(true)
});

const router = Router();

router.use(authMiddleware);

router.post('/premiere', async (req, res) => {
  try {
    const validated = ExportSchema.parse(req.body);
    
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const xml = await premiereExportService.generateProject(
      validated.projectId,
      {
        format: validated.format,
        resolution: validated.resolution,
        frameRate: validated.frameRate,
        includeAudio: validated.includeAudio,
        includeMarkers: validated.includeMarkers
      }
    );

    const filename = `${project.name.replace(/\s+/g, '_')}_${validated.format}.${
      validated.format === 'edl' ? 'edl' : validated.format === 'xml' ? 'xml' : 'xml'
    }`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(xml);
  } catch (error) {
    console.error('Premiere export failed:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Export failed' });
  }
});

router.get('/project/:projectId/preview', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    const shots = await prisma.shot.findMany({
      where: { projectId },
      orderBy: { sequence: 'asc' }
    });

    const assets = await prisma.asset.findMany({
      where: { projectId }
    });

    res.json({
      shots: shots.map((shot, idx) => ({
        id: shot.id,
        sequence: idx + 1,
        duration: shot.duration || 5,
        hasVideo: !!(shot as any).videoUrl,
        hasAudio: !!(shot as any).audioUrl
      })),
      totalAssets: assets.length,
      assetBreakdown: {
        images: assets.filter(a => a.type === 'image').length,
        videos: assets.filter(a => a.type === 'video').length,
        audio: assets.filter(a => a.type === 'audio').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

export default router;
