import { z } from 'zod';
import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';
import { buildCharacterImagePrompt } from '../config/prompt-templates';

const ImageGenerationSchema = z.object({
  prompt: z.string().min(10),
  negativePrompt: z.string().optional(),
  width: z.number().optional().default(1024),
  height: z.number().optional().default(576),
  style: z.string().optional(),
  characterRefImageId: z.string().optional(),
  sceneRefImageId: z.string().optional(),
  projectId: z.string(),
  model: z.string().optional()
});

export async function generateImage(input: z.infer<typeof ImageGenerationSchema>) {
  const validated = ImageGenerationSchema.parse(input);

  const enhancedPrompt = await buildEnhancedPrompt(validated);

  const task = await prisma.renderTask.create({
    data: {
      type: 'image',
      status: 'pending',
      params: validated as any,
      projectId: validated.projectId
    }
  });

  try {
    let provider: any;
    if (validated.model) {
      provider = aiProviderService.getProvider(validated.model) || aiProviderService;
    } else {
      provider = aiProviderService as any;
    }
    const result = await provider.generateImage({
      prompt: enhancedPrompt,
      negativePrompt: validated.negativePrompt,
      width: validated.width,
      height: validated.height
    });

    const asset = await prisma.asset.create({
      data: {
        type: 'image',
        url: result.url,
        metadata: {
          name: `图片生成 - ${enhancedPrompt.substring(0, 30)}...`,
          width: validated.width,
          height: validated.height,
          taskId: task.id,
          prompt: enhancedPrompt,
          thumbnailUrl: result.thumbnailUrl || result.url
        },
        projectId: validated.projectId
      }
    });

    await prisma.renderTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        params: { assetId: asset.id, url: result.url }
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

async function buildEnhancedPrompt(input: z.infer<typeof ImageGenerationSchema>): Promise<string> {
  const style = input.style || 'cinematic';
  
  return buildCharacterImagePrompt(input.prompt, undefined, undefined, undefined, style);
}

export async function batchGenerateImages(
  prompts: Array<z.infer<typeof ImageGenerationSchema>>
) {
  const queue = prompts.map((prompt, index) => 
    generateImage(prompt).then(result => ({ index, ...result }))
  );

  const results = await Promise.allSettled(queue);

  return results.map((result, index) => ({
    index,
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }));
}

export async function getTaskStatus(taskId: string) {
  const task = await prisma.renderTask.findUnique({
    where: { id: taskId }
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return {
    id: task.id,
    type: task.type,
    status: task.status,
    progress: task.progress,
    error: task.error
  };
}
