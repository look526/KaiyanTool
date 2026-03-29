import { prisma } from '../../lib/prisma';
import { providerManager } from '../ai/provider.manager';
import { buildPromptFromJson, isSimplePrompt } from './prompt-builder';
import { WorkspacePromptJson } from './prompt-builder';
import crypto from 'crypto';

export interface AnalyzeTextResult {
  prompt_json: WorkspacePromptJson;
  confidence: number;
}

const ANALYZE_SYSTEM_PROMPT = `你是一个专业的分镜生成AI。请将用户提供的文字描述转换为专业的JSON分镜格式。

输出格式（简化版）：
{
  "version": 1,
  "scene": "场景描述",
  "shot": "镜头描述",
  "subject": "主体描述",
  "props": ["道具1", "道具2"],
  "style": "风格描述",
  "audio": "音频描述（可选）"
}

请直接输出JSON，不要有其他内容。`;

export async function analyzeTextToPrompt(
  text: string,
  styleHint?: string
): Promise<AnalyzeTextResult> {
  const provider = providerManager.getProvider('zhipu');
  if (!provider) {
    return {
      prompt_json: {
        version: 1,
        scene: text,
        shot: '中景',
        subject: '',
        props: [],
        style: styleHint || '默认风格',
      },
      confidence: 0.5,
    };
  }

  try {
    const response = await provider.chat([
      { role: 'system', content: ANALYZE_SYSTEM_PROMPT },
      { role: 'user', content: `描述: ${text}\n风格提示: ${styleHint || '默认风格'}` }
    ], { model: 'glm-4' });

    const content = response.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        prompt_json: {
          version: 1,
          scene: text,
          shot: '中景',
          subject: '',
          props: [],
          style: styleHint || '默认风格',
        },
        confidence: 0.5,
      };
    }

    try {
      const promptJson = JSON.parse(jsonMatch[0]) as WorkspacePromptJson;
      return {
        prompt_json: { ...promptJson, version: 1 },
        confidence: 0.85,
      };
    } catch {
      return {
        prompt_json: {
          version: 1,
          scene: text,
          shot: '中景',
          subject: '',
          props: [],
          style: styleHint || '默认风格',
        },
        confidence: 0.5,
      };
    }
  } catch (error) {
    console.error('AI analyze failed:', error);
    return {
      prompt_json: {
        version: 1,
        scene: text,
        shot: '中景',
        subject: '',
        props: [],
        style: styleHint || '默认风格',
      },
      confidence: 0.5,
    };
  }
}

export async function generateFromPrompt(
  sourceNodeId: string,
  targetType: 'image' | 'video',
  providerId: string,
  model: string,
  promptJson: WorkspacePromptJson,
  style?: string,
  imageUrls?: string[]
): Promise<{ taskId: string; status: string; result_url?: string }> {
  const sourceNode = await prisma.canvasNode.findUnique({
    where: { id: sourceNodeId },
    include: { Workspace: { select: { user_id: true } } },
  });

  if (!sourceNode?.Workspace) {
    throw new Error('Source node not found');
  }

  const project = await prisma.project.findFirst({
    where: { owner_id: sourceNode.Workspace.user_id },
    orderBy: { created_at: 'asc' },
    select: { id: true },
  });

  if (!project) {
    throw new Error('No project found for workspace owner; cannot create render task');
  }

  const isSimple = isSimplePrompt(promptJson);
  const finalPrompt = isSimple
    ? buildPromptFromJson(promptJson)
    : JSON.stringify(promptJson);

  const task = await prisma.renderTask.create({
    data: {
      id: crypto.randomUUID(),
      type: targetType,
      status: 'processing',
      progress: 0,
      project_id: sourceNode.workspace_id,
      params: {
        prompt: finalPrompt,
        promptJson: JSON.parse(JSON.stringify(promptJson)),
        providerId,
        model,
        style,
        sourceNodeId,
      },
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  try {
    const providers = await prisma.aIProvider.findMany({
      where: { enabled: true },
      include: { AIProviderModel: true },
    });

    const providerConfig = providers.find(p => p.id === providerId);
    if (!providerConfig) {
      throw new Error(`Provider ${providerId} not found`);
    }

    providerManager.addProvider({
      id: providerConfig.id,
      name: providerConfig.type,
      type: providerConfig.type,
      apiKey: providerConfig.api_key,
      baseUrl: providerConfig.base_url || undefined,
    });

    const provider = providerManager.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not available`);
    }

    let modelApiId = model;
    const modelRow = await prisma.aIProviderModel.findFirst({
      where: {
        ai_provider_id: providerId,
        OR: [{ id: model }, { model_id: model }],
      },
      select: { model_id: true },
    });
    if (modelRow?.model_id?.trim()) {
      modelApiId = modelRow.model_id.trim();
    }

    if (targetType === 'image') {
      const result = await provider.createImage({
        model: modelApiId,
        prompt: finalPrompt,
        size: '1:1',
        quality: 'hd',
        n: 1,
        image_urls: imageUrls && imageUrls.length > 0 ? imageUrls : undefined,
      });

      const taskParams = task.params as Record<string, any>;
      await prisma.renderTask.update({
        where: { id: task.id },
        data: {
          status: 'completed',
          progress: 100,
          params: { ...taskParams, resultUrl: result.url },
        },
      });

      return { taskId: task.id, status: 'completed', result_url: result.url };
    }

    return { taskId: task.id, status: 'processing' };
  } catch (error) {
    await prisma.renderTask.update({
      where: { id: task.id },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw error;
  }
}

export async function getAvailableProviders() {
  const providers = await prisma.aIProvider.findMany({
    where: { enabled: true },
    include: { AIProviderModel: true },
  });

  return providers.map(p => ({
    id: p.id,
    name: p.type,
    type: p.type,
    models: p.AIProviderModel?.map(m => ({
      id: m.id,
      name: m.name,
      model_id: m.model_id,
      capabilities: m.capabilities || [],
      types: m.types || [],
    })) || [],
  }));
}
