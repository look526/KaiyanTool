import {
  FileText,
  Image,
  Video,
  Mic,
  Book,
  Network,
  List,
  Sparkles,
  Search,
  Bot,
  Zap,
  Coffee,
  Search as SearchIcon,
  SlidersHorizontal,
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
  { value: 'openai', label: 'OpenAI', icon: Sparkles, color: '#10b981', description: '全球领先的AI研究实验室' },
  { value: 'google', label: 'Google AI', icon: Search, color: '#4285f4', description: 'Google 大语言模型' },
  { value: 'antsk', label: 'AntSK', icon: Bot, color: '#ff6b35', description: '蚂蚁科技AI服务' },
  { value: 'zhipu', label: '智谱 AI', icon: Zap, color: '#6366f1', description: '国产大语言模型领导者' },
  { value: 'seedream', label: '豆包', icon: Coffee, color: '#ff8c00', description: '字节跳动AI模型' },
  { value: 'deepseek', label: 'DeepSeek', icon: SearchIcon, color: '#6b7280', description: '深度求索AI模型' },
  { value: 'toapis', label: 'ToAPIs', icon: Video, color: '#ec4899', description: '多模型 AI 服务（GPT、Claude、Gemini、Sora2、VEO3）' },
  { value: 'ecloud-seedance', label: '移动云 Seedance', icon: Video, color: '#0ea5e9', description: '移动云 AICC-Doubao-Seedance 2.0 视频生成服务' },
  { value: 'custom', label: '自定义', icon: SlidersHorizontal, color: '#14b8a6', description: 'OpenAI 兼容接口，可配置请求地址和模型列表' },
];

export const INITIAL_PROVIDER_FORM_DATA = {
  type: 'openai',
  api_key: '',
  base_url: '',
  enabled: true,
};

export const INITIAL_MODEL_FORM_DATA = {
  name: '',
  model_id: '',
  types: [] as string[],
  description: '',
  capabilities: [] as string[],
  enabled: true,
};
