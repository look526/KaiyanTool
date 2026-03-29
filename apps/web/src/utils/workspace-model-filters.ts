import { isImageModel } from '../types/ai';

/** 工作区 Provider 模型（与 /workspace/ai/providers 对齐） */
export interface WorkspaceProviderModel {
  id: string;
  name: string;
  model_id?: string | null;
  capabilities?: string[];
  types?: string[];
}

/**
 * 文生图 / 图生图：仅展示具备图像能力的模型，排除纯对话模型。
 * 依赖 DB 的 capabilities；若无元数据则用语义与静态表兜底。
 */
export function filterModelsForImageGeneration(models: WorkspaceProviderModel[]): WorkspaceProviderModel[] {
  return models.filter((m) => isWorkspaceImageCapableModel(m));
}

export function isWorkspaceImageCapableModel(m: WorkspaceProviderModel): boolean {
  const caps = (m.capabilities || []).map((c) => String(c).toLowerCase());
  if (caps.some((c) => c.includes('image') || c.includes('image-generation'))) return true;
  if (caps.some((c) => c.includes('video'))) return false;
  if (
    caps.length > 0 &&
    caps.every((c) => c.includes('text') || c.includes('chat') || c === 'embedding') &&
    !caps.some((c) => c.includes('image'))
  ) {
    return false;
  }
  const apiId = (m.model_id || m.name || '').trim();
  if (apiId && isImageModel(apiId)) return true;
  const hint = `${m.name} ${m.model_id || ''}`.toLowerCase();
  return /cogview|flux|dall|image|sd|seed|nano|stable|kontext|midjourney|绘画|生图|图生|文生图|4o-image|flash-image|imagen|wanx|qwen.*vl|qwen-vl/.test(
    hint
  );
}

export function filterModelsForVideoGeneration(models: WorkspaceProviderModel[]): WorkspaceProviderModel[] {
  return models.filter((m) => {
    const caps = (m.capabilities || []).map((c) => String(c).toLowerCase());
    if (caps.some((c) => c.includes('video'))) return true;
    const hint = `${m.name} ${m.model_id || ''}`.toLowerCase();
    return /sora|veo|kling|runway|video|视频/.test(hint);
  });
}
