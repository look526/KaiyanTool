import { z } from 'zod';
import { prisma } from '../lib/prisma';

const VideoGenerationSchema = z.object({
  startFrameId: z.string().optional(),
  endFrameId: z.string().optional(),
  prompt: z.string().optional(),
  duration: z.number().optional().default(5),
  projectId: z.string(),
  shotId: z.string().optional()
});

export async function generateVideo(input: z.infer<typeof VideoGenerationSchema>) {
  const validated = VideoGenerationSchema.parse(input);

  const task = await prisma.renderTask.create({
    data: {
      type: 'video',
      status: 'pending',
      params: validated as any,
      projectId: validated.projectId
    }
  });

  try {
    const asset = await prisma.asset.create({
      data: {
        type: 'video',
        url: '',
        metadata: {
          taskId: task.id,
          startFrameId: validated.startFrameId,
          endFrameId: validated.endFrameId,
          duration: validated.duration
        },
        projectId: validated.projectId
      }
    });

    await prisma.renderTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        progress: 100,
        params: JSON.stringify({ assetId: asset.id })
      }
    });

    return { asset, taskId: task.id };
  } catch (error) {
    await prisma.renderTask.update({
      where: { id: task.id },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    throw error;
  }
}

export async function interpolateFrames(
  startFrameId: string,
  endFrameId: string,
  projectId: string
) {
  const startAsset = await prisma.asset.findUnique({
    where: { id: startFrameId }
  });

  const endAsset = await prisma.asset.findUnique({
    where: { id: endFrameId }
  });

  if (!startAsset || !endAsset) {
    throw new Error('Frame assets not found');
  }

  const task = await prisma.renderTask.create({
    data: {
      type: 'video-interpolation',
      status: 'pending',
      params: { startFrameId, endFrameId },
      projectId
    }
  });

  try {
    const asset = await prisma.asset.create({
      data: {
        type: 'video',
        url: '',
        metadata: {
          taskId: task.id,
          interpolation: true
        },
        projectId
      }
    });

    await prisma.renderTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        params: JSON.stringify({ assetId: asset.id })
      }
    });

    return { asset, taskId: task.id };
  } catch (error) {
    await prisma.renderTask.update({
      where: { id: task.id },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    throw error;
  }
}
