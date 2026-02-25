export interface StylePreset {
  id: string;
  name: string;
  description: string;
  category: 'cinematic' | 'realistic' | 'anime' | 'artistic' | 'custom';
  preview: string;
  promptKeywords: string[];
  colorPalette?: string[];
  recommendedFor: string[];
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cinematic',
    name: '电影质感',
    description: '专业光影、电影级调色、高对比度',
    category: 'cinematic',
    preview: '/styles/cinematic.jpg',
    promptKeywords: [
      'cinematic lighting',
      'professional color grading',
      'film quality',
      'high contrast',
      'dramatic atmosphere',
      'movie aesthetic'
    ],
    colorPalette: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
    recommendedFor: ['电影短片', '高端广告', '纪录片', '剧情视频']
  },
  {
    id: 'realistic',
    name: '高清实拍',
    description: '写实风格、高清晰度、自然色彩',
    category: 'realistic',
    preview: '/styles/realistic.jpg',
    promptKeywords: [
      'realistic',
      'high definition',
      'natural colors',
      'photorealistic',
      'detailed texture',
      'sharp focus'
    ],
    colorPalette: ['#f8f9fa', '#e9ecef', '#dee2e6', '#6c757d'],
    recommendedFor: ['商业广告', '产品展示', '企业宣传片', '教学视频']
  },
  {
    id: 'gothic',
    name: '暗黑哥特',
    description: '低饱和度、神秘氛围、暗色调',
    category: 'artistic',
    preview: '/styles/gothic.jpg',
    promptKeywords: [
      'gothic',
      'dark atmosphere',
      'mysterious',
      'low saturation',
      'dramatic shadows',
      'elegant darkness'
    ],
    colorPalette: ['#1a1a1a', '#2d2d2d', '#3d3d3d', '#4a4a4a'],
    recommendedFor: ['悬疑惊悚', '奇幻题材', '恐怖片', '神秘剧情']
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: '霓虹色调、科技元素、未来感',
    category: 'artistic',
    preview: '/styles/cyberpunk.jpg',
    promptKeywords: [
      'cyberpunk',
      'neon lights',
      'futuristic',
      'sci-fi',
      'high-tech',
      'digital art',
      'urban future'
    ],
    colorPalette: ['#00ff00', '#ff00ff', '#00ffff', '#ff6600'],
    recommendedFor: ['科幻题材', '未来感内容', '科技产品', '游戏宣传']
  },
  {
    id: 'anime',
    name: '日漫风格',
    description: '日系画风、二次元特征、明亮色彩',
    category: 'anime',
    preview: '/styles/anime.jpg',
    promptKeywords: [
      'anime style',
      'Japanese animation',
      '2D',
      'manga art',
      'vibrant colors',
      'clean lines'
    ],
    colorPalette: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'],
    recommendedFor: ['二次元内容', '动漫短剧', '游戏宣传', '年轻受众']
  },
  {
    id: 'shinkai',
    name: '新海诚风',
    description: '唯美光影、细腻情感、清新色调',
    category: 'anime',
    preview: '/styles/shinkai.jpg',
    promptKeywords: [
      'Makoto Shinkai style',
      'beautiful lighting',
      'emotional',
      'sky and clouds',
      'soft colors',
      'atmospheric'
    ],
    colorPalette: ['#87ceeb', '#ffa07a', '#98fb98', '#e6e6fa'],
    recommendedFor: ['治愈系', '青春题材', '爱情故事', '情感表达']
  },
  {
    id: 'ink',
    name: '国风水墨',
    description: '水墨笔触、东方美学、留白艺术',
    category: 'artistic',
    preview: '/styles/ink.jpg',
    promptKeywords: [
      'Chinese ink painting',
      'traditional art',
      'minimalist',
      'oriental aesthetic',
      'brush strokes',
      'elegant simplicity'
    ],
    colorPalette: ['#000000', '#333333', '#666666', '#999999'],
    recommendedFor: ['古风', '传统文化', '历史题材', '艺术表达']
  },
  {
    id: 'game',
    name: '游戏原画',
    description: '精致细节、游戏感、高完成度',
    category: 'artistic',
    preview: '/styles/game.jpg',
    promptKeywords: [
      'game concept art',
      'detailed',
      'high quality',
      'fantasy art',
      'character design',
      'epic composition'
    ],
    colorPalette: ['#8b5cf6', '#6366f1', '#ec4899', '#14b8a6'],
    recommendedFor: ['游戏宣传', '概念设计', '奇幻题材', '角色设计']
  },
  {
    id: 'custom',
    name: '自定义',
    description: '用户自定义风格参数',
    category: 'custom',
    preview: '/styles/custom.jpg',
    promptKeywords: [],
    recommendedFor: ['个性化需求', '特殊风格', '品牌定制']
  }
];

export function getStyleById(id: string): StylePreset | undefined {
  return STYLE_PRESETS.find(style => style.id === id);
}

export function getStylesByCategory(category: StylePreset['category']): StylePreset[] {
  return STYLE_PRESETS.filter(style => style.category === category);
}

export function getRecommendedStyles(purpose: string): StylePreset[] {
  return STYLE_PRESETS.filter(style =>
    style.recommendedFor.some(rec => rec.includes(purpose))
  );
}

export function generateStylePrompt(
  styleId: string,
  basePrompt: string
): string {
  const style = getStyleById(styleId);
  if (!style || style.id === 'custom') {
    return basePrompt;
  }

  const styleKeywords = style.promptKeywords.join(', ');
  return `${basePrompt}, ${styleKeywords}`;
}

export function getStyleColorPalette(styleId: string): string[] {
  const style = getStyleById(styleId);
  return style?.colorPalette || [];
}
