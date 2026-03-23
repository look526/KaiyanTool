import { z } from 'zod';
import { providerManager } from '../services/ai/provider.manager';
import { prisma } from '../lib/prisma';
import { buildCharacterImagePrompt, buildThreeViewPrompt } from '../config/prompt-templates';
import { ASSET_CATEGORIES, ASSET_SOURCES, AssetCategory } from '../constants/asset-categories';
import { getResolutionSize } from '../types/seedream.types';
import crypto from 'crypto';

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
  character_ref_image_id: z.string().optional(),
  scene_ref_image_id: z.string().optional(),
  referenceImageUrl: z.string().optional(),
  project_id: z.string().optional().nullable(),
  model: z.string().optional(),
  category: z.string().optional(),
  source: z.string().optional(),
  three_view: z.boolean().optional(),
  watermark: z.boolean().optional()
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
      id: crypto.randomUUID(),
      type: 'image',
      status: 'processing',
      progress: 0,
      params: { ...validated, width: finalWidth, height: finalHeight },
      project_id: validated.project_id || null,
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  try {
    await prisma.renderTask.update({
      where: { id: task.id },
      data: { progress: 10 }
    });

    const aiProviders = await prisma.aIProvider.findMany({
      where: { enabled: true },
      include: { AIProviderModel: true },
    });

    let provider: any;

    if (validated.model) {
      for (const p of aiProviders) {
        const foundModel = p.AIProviderModel?.find((m: any) => m.id === validated.model || m.name === validated.model);
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
      name: provider.type,
      type: provider.type as any,
      apiKey: provider.api_key,
      baseUrl: provider.base_url || undefined,
    });

    const aiProvider = providerManager.getProvider(provider.id);
    if (!aiProvider) {
      throw new Error('Failed to initialize AI provider');
    }

    await prisma.renderTask.update({
      where: { id: task.id },
      data: { progress: 30 }
    });

    const result = await aiProvider.createImage({
      prompt: enhancedPrompt,
      size: (validated.size || '1:1') as any,
      resolution: validated.resolution || '2K',
      n: validated.n || 1,
      image_urls: validated.image_urls,
      style: validated.style,
    });

    console.log('[DEBUG] AI provider result:', {
      hasUrl: !!result.url,
      url: result.url ? result.url.substring(0, 100) + '...' : 'empty',
      hasThumbnailUrl: !!result.thumbnailUrl,
    });

    await prisma.renderTask.update({
      where: { id: task.id },
      data: { progress: 70 }
    });

    const category = validated.category || inferCategoryFromPrompt(validated.prompt);
    const source = validated.source || ASSET_SOURCES.AI_GENERATION;

    const asset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
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
        project_id: validated.project_id || null,
        category,
        source,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('[DEBUG] Asset created:', {
      assetId: asset.id,
      hasUrl: !!asset.url,
      url: asset.url ? asset.url.substring(0, 100) + '...' : 'empty',
    });

    await prisma.renderTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        progress: 100,
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
  
  if (input.three_view) {
    return buildThreeViewPrompt(input.prompt, style);
  }
  
  return buildCharacterImagePrompt(input.prompt, undefined, undefined, undefined, style);
}

export async function batchGenerateImages(
  prompts: Array<z.infer<typeof ImageGenerationSchema>>
) {
  const successfulResults = [];
  const errors = [];
  
  for (let i = 0; i < prompts.length; i++) {
    try {
      const result = await generateImage(prompts[i]);
      console.log(`[DEBUG] Generated image ${i}:`, { 
        assetId: result.asset?.id, 
        url: result.asset?.url,
        hasAsset: !!result.asset,
      });
      successfulResults.push(result);
    } catch (error) {
      console.error(`[DEBUG] Failed to generate image ${i}:`, error);
      errors.push({ index: i, error: error instanceof Error ? error.message : 'Generation failed' });
    }
  }

  const assets = successfulResults.map((r, idx) => {
    const url = r.asset?.url || '';
    console.log(`[DEBUG] Mapping result ${idx}:`, { 
      hasAsset: !!r.asset, 
      url,
      asset: r.asset ? { id: r.asset.id, type: r.asset.type } : 'no asset',
    });
    return { url };
  });

  console.log('[DEBUG] Final batch response:', { 
    assetsCount: assets.length, 
    errorsCount: errors.length,
    assetsWithUrl: assets.filter(a => a.url).length,
  });

  return {
    assets,
    errors: errors.length > 0 ? errors : undefined,
  };
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
  project_id: string,
  characterDescription: string,
  style: string = 'cinematic',
  model?: string
) {
  return generateImage({
    prompt: characterDescription,
    project_id,
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
  project_id: string,
  itemDescription: string,
  style: string = 'cinematic',
  model?: string
) {
  return generateImage({
    prompt: itemDescription,
    project_id,
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
  project_id: string,
  sceneDescription: string,
  style: string = 'cinematic',
  model?: string
) {
  return generateImage({
    prompt: sceneDescription,
    project_id,
    style,
    model,
    n: 1,
    width: 1024,
    height: 576,
    category: ASSET_CATEGORIES.SCENE,
    source: ASSET_SOURCES.SCENE_GENERATION
  });
}
