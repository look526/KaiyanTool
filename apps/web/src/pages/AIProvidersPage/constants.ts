import {
  FileText,
  Image,
  Video,
  Mic,
  Book,
  Network,
  List,
  Sparkles,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';

import { ContentType, ProviderType } from './types';

export const CONTENT_TYPES: ContentType[] = [
  { value: 'text', label: '文本生成', icon: FileText, color: '#6366f1' },
  { value: 'image', label: '图像生成', icon: Image, color: '#ec4899' },
  { value: 'video', label: '视频生成', icon: Video, color: '#10b981' },
  { value: 'audio', label: '音频生成', icon: Mic, color: '#f59e0b' },
  { value: 'script', label: '剧本创作', icon: Book, color: '#8b5cf6' },
  { value: 'novel', label: '小说创作', icon: Sparkles, color: '#06b6d4' },
  { value: 'storyline', label: '故事线', icon: Network, color: '#ef4444' },
  { value: 'outline', label: '大纲生成', icon: List, color: '#84cc16' },
];

export const PROVIDER_TYPES: ProviderType[] = [
  { value: 'zhipu', label: '智谱 AI', icon: Zap, color: '#6366f1', description: '国产大语言模型领导者' },
  { value: 'openai', label: 'OpenAI', icon: Sparkles, color: '#10b981', description: '全球领先的AI研究实验室' },
  { value: 'anthropic', label: 'Anthropic', icon: Globe, color: '#f59e0b', description: '安全可靠的AI助手' },
  { value: 'deepseek', label: 'DeepSeek', icon: Lock, color: '#ec4899', description: '深度求索AI模型' },
];

export const INITIAL_PROVIDER_FORM_DATA = {
  type: 'zhipu',
  apiKey: '',
  baseUrl: '',
  enabled: true,
};

export const INITIAL_MODEL_FORM_DATA = {
  name: '',
  modelId: '',
  types: [] as string[],
  description: '',
  capabilities: [] as string[],
  enabled: true,
};
