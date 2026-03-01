import { z } from 'zod';
import { providerManager } from '../services/ai/provider.manager';
import { prisma } from '../lib/prisma';
import { buildCharacterImagePrompt, buildThreeViewPrompt } from '../config/prompt-templates';
import { ASSET_CATEGORIES, ASSET_SOURCES, AssetCategory } from '../constants/asset-categories';
import { getResolutionSize } from '../types/seedream.types';

const ImageGenerationSchema = z.object({
  prompt: z.string().min(10),
  negativePrompt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  size: z.string().optional(),
  resolution: z.enum(['2K', '3K']).optional(),
  style: z.string().optional(),
  n: z.number().min(1).max(15).optional(),
  image_urls: z.array(z.string()).optional(),
  characterRefImageId: z.string().optional(),
  sceneRefImageId: z.string().optional(),
  projectId: z.string(),
  model: z.string().optional(),
  category: z.string().optional(),
  source: z.string().optional(),
  threeView: z.boolean().optional()
});

export async function generateImage(input: z.infer<typeof ImageGenerationSchema>) {
  const validated = ImageGenerationSchema.parse(input);

  const enhancedPrompt = await buildEnhancedPrompt(validated);

  let finalWidth = validated.width;
  let finalHeight = validated.height;

  if (validated.resolution && validated.size) {
    const size = getResolutionSize(validated.resolution, validated.size);
    finalWidth = size.width;
    finalHeight = size.height;
  } else if (!finalWidth || !finalHeight) {
    finalWidth = 1024;
    finalHeight = 1024;
  }

  const task = await prisma.renderTask.create({
    data: {
      type: 'image',
      status: 'pending',
      params: { ...validated, width: finalWidth, height: finalHeight },
      projectId: validated.projectId
    }
  });

  try {
    const aiProviders = await prisma.aIProvider.findMany({
      where: { enabled: true },
      include: { models: true },
    });

    let provider: any;

    if (validated.model) {
      for (const p of aiProviders) {
        const foundModel = p.models?.find((m: any) => m.id === validated.model || m.name === validated.model);
        if (foundModel) {
          provider = p;
          break;
        }
      }
    }

    if (!provider) {
      throw new Error('No AI provider available');
    }

    providerManager.addProvider({
      id: provider.id,
      name: provider.name,
      type: provider.type as any,
      apiKey: provider.apiKey,
      baseUrl: provider.baseUrl || undefined,
    });

    console.log('[ImageGeneration] Provider added:', { id: provider.id, type: provider.type, name: provider.name });

    const aiProvider = providerManager.getProvider(provider.id);
    console.log('[ImageGeneration] Got provider:', aiProvider, 'type:', aiProvider?.constructor?.name);
    if (!aiProvider) {
      throw new Error('Failed to initialize AI provider');
    }

    const result = await aiProvider.createImage({
      prompt: enhancedPrompt,
      size: (validated.size || '1:1') as any,
      resolution: validated.resolution || '2K',
      n: validated.n || 1,
      image_urls: validated.image_urls,
      style: validated.style,
    });

    const category = validated.category || inferCategoryFromPrompt(validated.prompt);
    const source = validated.source || ASSET_SOURCES.AI_GENERATION;

    const asset = await prisma.asset.create({
      data: {
        type: 'image',
        url: result.url,
        metadata: {
          name: `图片生成 - ${enhancedPrompt.substring(0, 30)}...`,
          width: finalWidth,
          height: finalHeight,
          taskId: task.id,
          prompt: enhancedPrompt,
          thumbnailUrl: result.thumbnailUrl || result.url,
          size: validated.size,
          resolution: validated.resolution,
        },
        projectId: validated.projectId,
        category,
        source
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

function inferCategoryFromPrompt(prompt: string): AssetCategory {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('角色') || lowerPrompt.includes('人物') || 
      lowerPrompt.includes('character') || lowerPrompt.includes('portrait') ||
      lowerPrompt.includes('脸') || lowerPrompt.includes('身体')) {
    return ASSET_CATEGORIES.CHARACTER;
  }
  
  if (lowerPrompt.includes('场景') || lowerPrompt.includes('背景') || 
      lowerPrompt.includes('scene') || lowerPrompt.includes('background') ||
      lowerPrompt.includes('环境') || lowerPrompt.includes('地点')) {
    return ASSET_CATEGORIES.SCENE;
  }
  
  if (lowerPrompt.includes('物品') || lowerPrompt.includes('道具') || 
      lowerPrompt.includes('item') || lowerPrompt.includes('prop') ||
      lowerPrompt.includes('武器') || lowerPrompt.includes('工具')) {
    return ASSET_CATEGORIES.ITEM;
  }
  
  if (lowerPrompt.includes('特效') || lowerPrompt.includes('效果') || 
      lowerPrompt.includes('effect') || lowerPrompt.includes('magic')) {
    return ASSET_CATEGORIES.EFFECT;
  }
  
  return ASSET_CATEGORIES.GENERAL;
}

async function buildEnhancedPrompt(input: z.infer<typeof ImageGenerationSchema>): Promise<string> {
  const style = input.style || 'cinematic';
  
  console.log('[DEBUG] buildEnhancedPrompt input:', { prompt: input.prompt, threeView: input.threeView, style });
  
  if (input.threeView) {
    console.log('[DEBUG] Using buildThreeViewPrompt with style:', style);
    return buildThreeViewPrompt(input.prompt, style);
  }
  
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

export async function generateCharacterImage(
  projectId: string,
  characterDescription: string,
  style: string = 'cinematic',
  model?: string
) {
  return generateImage({
    prompt: characterDescription,
    projectId,
    style,
    model,
    n: 1,
    width: 1024,
    height: 1024,
    category: ASSET_CATEGORIES.CHARACTER,
    source: ASSET_SOURCES.CHARACTER_GENERATION
  });
}

export async function generateItemImage(
  projectId: string,
  itemDescription: string,
  style: string = 'cinematic',
  model?: string
) {
  return generateImage({
    prompt: itemDescription,
    projectId,
    style,
    model,
    n: 1,
    width: 1024,
    height: 1024,
    category: ASSET_CATEGORIES.ITEM,
    source: ASSET_SOURCES.ITEM_GENERATION
  });
}

export async function generateSceneImage(
  projectId: string,
  sceneDescription: string,
  style: string = 'cinematic',
  model?: string
) {
  return generateImage({
    prompt: sceneDescription,
    projectId,
    style,
    model,
    n: 1,
    width: 1024,
    height: 576,
    category: ASSET_CATEGORIES.SCENE,
    source: ASSET_SOURCES.SCENE_GENERATION
  });
}
