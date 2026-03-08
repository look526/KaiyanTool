import { z } from 'zod';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const VideoGenerationSchema = z.object({
  start_frame_id: z.string().optional(),
  end_frame_id: z.string().optional(),
  prompt: z.string().optional(),
  duration: z.number().optional().default(5),
  project_id: z.string(),
  shot_id: z.string().optional()
});

export async function generateVideo(input: z.infer<typeof VideoGenerationSchema>) {
  const validated = VideoGenerationSchema.parse(input);

  const now = new Date();
  const task = await prisma.renderTask.create({
    data: {
      id: crypto.randomUUID(),
      type: 'video',
      status: 'pending',
      params: validated as any,
      project_id: validated.project_id,
      created_at: now,
      updated_at: now
    }
  });

  try {
    const now = new Date();
    const asset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        type: 'video',
        url: '',
        metadata: {
          taskId: task.id,
          start_frame_id: validated.start_frame_id,
          end_frame_id: validated.end_frame_id,
          duration: validated.duration
        },
        project_id: validated.project_id,
        created_at: now,
        updated_at: now
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
  start_frame_id: string,
  end_frame_id: string,
  project_id: string
) {
  const startAsset = await prisma.asset.findUnique({
    where: { id: start_frame_id }
  });

  const endAsset = await prisma.asset.findUnique({
    where: { id: end_frame_id }
  });

  if (!startAsset || !endAsset) {
    throw new Error('Frame assets not found');
  }

  const now = new Date();
  const task = await prisma.renderTask.create({
    data: {
      id: crypto.randomUUID(),
      type: 'video-interpolation',
      status: 'pending',
      params: { start_frame_id, end_frame_id },
      project_id,
      created_at: now,
      updated_at: now
    }
  });

  try {
    const now = new Date();
    const asset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        type: 'video',
        url: '',
        metadata: {
          taskId: task.id,
          interpolation: true
        },
        project_id: project_id,
        created_at: now,
        updated_at: now
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
