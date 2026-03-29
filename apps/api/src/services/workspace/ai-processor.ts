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
  style?: string
): Promise<{ taskId: string; status: string }> {
  const sourceNode = await prisma.canvasNode.findUnique({
    where: { id: sourceNodeId },
  });

  if (!sourceNode) {
    throw new Error('Source node not found');
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
      params: {
        prompt: finalPrompt,
        promptJson,
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
      name: providerConfig.name,
      type: providerConfig.type,
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.baseUrl || undefined,
    });

    const provider = providerManager.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not available`);
    }

    if (targetType === 'image') {
      const result = await provider.createImage({
        prompt: finalPrompt,
        size: '1:1',
        resolution: '2K',
        n: 1,
      });

      await prisma.renderTask.update({
        where: { id: task.id },
        data: {
          status: 'completed',
          progress: 100,
          params: { ...task.params, resultUrl: result.url },
        },
      });

      await prisma.canvasNode.update({
        where: { id: sourceNodeId },
        data: {
          output_url: result.url,
          updated_at: new Date(),
        },
      });

      return { taskId: task.id, status: 'completed' };
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
    include: { models: true },
  });

  return providers.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    models: p.AIProviderModel?.map(m => ({
      id: m.id,
      name: m.name,
    })) || [],
  }));
}
