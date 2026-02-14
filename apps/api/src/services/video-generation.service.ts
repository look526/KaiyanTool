import { z } from 'zod';
import { aiProviderService } from '../services/ai/provider.service';
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

  const context = await buildVideoContext(validated);

  try {
    const result = await aiProviderService.generateVideo({
      startFrameUrl: context.startFrame,
      endFrameUrl: context.endFrame,
      prompt: validated.prompt,
      duration: validated.duration
    });

    const asset = await prisma.asset.create({
      data: {
        type: 'video',
        url: result.url,
        duration: validated.duration,
        metadata: {
          taskId: task.id,
          startFrameId: validated.startFrameId,
          endFrameId: validated.endFrameId
        },
        projectId: validated.projectId
      }
    });

    await prisma.renderTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        progress: 100,
        result: { assetId: asset.id, url: result.url }
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

async function buildVideoContext(input: VideoGenerationSchema) {
  const context = {
    startFrame: undefined as string | undefined,
    endFrame: undefined as string | undefined
  };

  if (input.startFrameId) {
    const asset = await prisma.asset.findUnique({
      where: { id: input.startFrameId }
    });
    context.startFrame = asset?.url;
  }

  if (input.endFrameId) {
    const asset = await prisma.asset.findUnique({
      where: { id: input.endFrameId }
    });
    context.endFrame = asset?.url;
  }

  return context;
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
    const result = await aiProviderService.interpolateFrames({
      startFrameUrl: startAsset.url,
      endFrameUrl: endAsset.url
    });

    const asset = await prisma.asset.create({
      data: {
        type: 'video',
        url: result.url,
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
        result: { assetId: asset.id, frames: result.frames }
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
