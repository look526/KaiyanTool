import React, { useState } from 'react';
import { BentoCardSmall } from './BentoCardSmall';
import { RefreshCw, Sparkles } from 'lucide-react';

export interface QuickPrompt {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  tags?: string[];
}

interface QuickPromptsProps {
  prompts?: QuickPrompt[];
  onSelect: (prompt: string) => void;
  onRefresh?: () => void;
  maxDisplay?: number;
  className?: string;
}

const DEFAULT_PROMPTS: QuickPrompt[] = [
  {
    id: '1',
    label: '电影风格',
    icon: '🎬',
    prompt: 'Cinematic shot, dramatic lighting, high contrast, professional photography, 8K resolution',
    tags: ['电影', '高清']
  },
  {
    id: '2',
    label: '动漫风格',
    icon: '🎨',
    prompt: 'Anime style, vibrant colors, clean lines, Studio Ghibli inspired',
    tags: ['动漫', '日系']
  },
  {
    id: '3',
    label: '写实风格',
    icon: '📸',
    prompt: 'Photorealistic, natural lighting, detailed textures, ultra realistic',
    tags: ['写实', '真实']
  },
  {
    id: '4',
    label: '插画风格',
    icon: '🖼️',
    prompt: 'Digital illustration, flat design, minimalist, clean aesthetic',
    tags: ['插画', '简约']
  },
  {
    id: '5',
    label: '水彩风格',
    icon: '💧',
    prompt: 'Watercolor painting, soft edges, pastel colors, artistic brushstrokes',
    tags: ['水彩', '艺术']
  },
  {
    id: '6',
    label: '科幻风格',
    icon: '🚀',
    prompt: 'Sci-fi concept art, futuristic, neon lights, cyberpunk aesthetic',
    tags: ['科幻', '未来']
  }
];

export function QuickPrompts({
  prompts = DEFAULT_PROMPTS,
  onSelect,
  onRefresh,
  maxDisplay = 6,
  className = ''
}: QuickPromptsProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setRefreshing(false), 500);
  };

  const displayPrompts = prompts.slice(0, maxDisplay);

  return (
    <div className={`quick-prompts ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-lg">推荐尝试</h3>
        </div>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="刷新推荐"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayPrompts.map((prompt, index) => (
          <div
            key={prompt.id}
            className="cursor-pointer group"
            onClick={() => onSelect(prompt.prompt)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <BentoCardSmall
              className="h-full transition-all duration-300 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center text-center"
              interactive
            >
              <div className="text-3xl mb-2">{prompt.icon}</div>
              <div className="font-medium text-sm mb-1">{prompt.label}</div>
              {prompt.tags && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {prompt.tags.join(' · ')}
                </div>
              )}
            </BentoCardSmall>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickPrompts;
