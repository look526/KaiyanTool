export type ModelCapability = 'chat' | 'image' | 'video';

export interface ToAPIsModelInfo {
  id: string;
  name: string;
  provider: 'toapis';
  capabilities: ModelCapability[];
  is_veo3?: boolean;
  is_image?: boolean;
  default_params?: {
    duration?: number;
    aspect_ratio?: string;
    size?: string;
    quality?: string;
    style?: string;
  };
}

export const TOAPIS_MODELS: ToAPIsModelInfo[] = [
  // Chat 模型
  { id: 'gpt-5', name: 'GPT-5', provider: 'toapis', capabilities: ['chat'] },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'toapis', capabilities: ['chat'] },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5', provider: 'toapis', capabilities: ['chat'] },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'toapis', capabilities: ['chat'] },
  // 图片模型
  { id: 'gpt-4o-image', name: 'GPT-4o Image', provider: 'toapis', capabilities: ['image'], is_image: true,
    default_params: { size: '1024x1024', quality: 'standard' } },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image', provider: 'toapis', capabilities: ['image'], is_image: true,
    default_params: { size: '1024x1024', quality: 'hd' } },
  { id: 'gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Image', provider: 'toapis', capabilities: ['image'], is_image: true,
    default_params: { size: '1024x1024' } },
  { id: 'gemini-2.5-flash-image-preview', name: 'Gemini 2.5 Flash Image', provider: 'toapis', capabilities: ['image'], is_image: true,
    default_params: { size: '1024x1024' } },
  { id: 'seedream-4.0', name: 'Seedream 4.0', provider: 'toapis', capabilities: ['image'], is_image: true,
    default_params: { size: '1024x1024' } },
  { id: 'seedream-4.5', name: 'Seedream 4.5', provider: 'toapis', capabilities: ['image'], is_image: true,
    default_params: { size: '1024x1024', quality: 'hd' } },
  { id: 'seedream-5.0', name: 'Seedream 5.0', provider: 'toapis', capabilities: ['image'], is_image: true,
    default_params: { size: '1024x1024', quality: 'hd' } },
  { id: 'flux-kontext', name: 'Flux Kontext', provider: 'toapis', capabilities: ['image'], is_image: true,
    default_params: { size: '1024x1024' } },
  { id: 'flux-2.0', name: 'Flux 2.0', provider: 'toapis', capabilities: ['image'], is_image: true,
    default_params: { size: '1024x1024' } },
  { id: 'grok-image', name: 'Grok Image', provider: 'toapis', capabilities: ['image'], is_image: true,
    default_params: { size: '1024x1024' } },
  // 视频模型
  { id: 'sora-2', name: 'Sora 2 标准版', provider: 'toapis', capabilities: ['video'],
    default_params: { duration: 10, aspect_ratio: '16:9' } },
  { id: 'sora-2-pro', name: 'Sora 2 专业版', provider: 'toapis', capabilities: ['video'],
    default_params: { duration: 15, aspect_ratio: '16:9' } },
  { id: 'sora-2-vip', name: 'Sora 2 VIP版', provider: 'toapis', capabilities: ['video'],
    default_params: { duration: 20, aspect_ratio: '16:9' } },
  { id: 'veo3', name: 'VEO3', provider: 'toapis', capabilities: ['video'], is_veo3: true,
    default_params: { duration: 10, aspect_ratio: '16:9' } },
  { id: 'veo3-pro', name: 'VEO3 Pro', provider: 'toapis', capabilities: ['video'], is_veo3: true,
    default_params: { duration: 10, aspect_ratio: '16:9' } },
];

export function getModelCapabilities(modelId: string): ModelCapability[] {
  const model = TOAPIS_MODELS.find(m => m.id === modelId);
  return model?.capabilities || [];
}

export function isVideoModel(modelId: string): boolean {
  return getModelCapabilities(modelId).includes('video');
}

export function isImageModel(modelId: string): boolean {
  const model = TOAPIS_MODELS.find(m => m.id === modelId);
  return model?.is_image || getModelCapabilities(modelId).includes('image');
}

export function isVEO3Model(modelId: string): boolean {
  const model = TOAPIS_MODELS.find(m => m.id === modelId);
  return model?.is_veo3 || false;
}

export function getModelDefaultParams(modelId: string): Record<string, any> {
  const model = TOAPIS_MODELS.find(m => m.id === modelId);
  return model?.default_params || {};
}
