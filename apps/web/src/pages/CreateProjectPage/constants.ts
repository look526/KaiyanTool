import { LucideIcon } from 'lucide-react';
import { FileText, BookOpen, Layers, Video, Camera, Clapperboard, Film, GraduationCap, ShoppingBag, Zap, Sparkles } from 'lucide-react';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  type: 'script' | 'novel' | 'mixed';
  category: 'video' | 'content' | 'education' | 'commercial';
  features: string[];
  presetConfig?: {
    description?: string;
    initialScene?: string;
  };
  gradient: string;
  popular?: boolean;
  quickCreate?: boolean;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: '空白项目',
    description: '从零开始创建您的项目',
    icon: Sparkles,
    type: 'mixed',
    category: 'content',
    features: ['完全自定义', '灵活配置', '支持所有类型'],
    gradient: 'from-gray-500 to-gray-600',
    quickCreate: true,
  },
  {
    id: 'short-video',
    name: '短视频项目',
    description: '适用于抖音、快手等短视频平台',
    icon: Video,
    type: 'script',
    category: 'video',
    features: ['场景快速切换', '时长优化', '热点追踪'],
    presetConfig: {
      description: '用于创建短视频内容，支持快速场景切换和时长优化',
      initialScene: '开场 -> 主体 -> 结尾',
    },
    gradient: 'from-pink-500 to-rose-500',
    popular: true,
  },
  {
    id: 'long-video',
    name: '长视频项目',
    description: '适用于YouTube、B站等长视频平台',
    icon: Film,
    type: 'script',
    category: 'video',
    features: ['章节管理', '剧情规划', '多角色支持'],
    presetConfig: {
      description: '用于创建长视频内容，支持章节管理和剧情规划',
    },
    gradient: 'from-blue-500 to-indigo-500',
    popular: true,
  },
  {
    id: 'advertisement',
    name: '广告项目',
    description: '用于商业广告和宣传片制作',
    icon: ShoppingBag,
    type: 'script',
    category: 'commercial',
    features: ['品牌植入', '产品展示', '转化优化'],
    presetConfig: {
      description: '用于商业广告制作，支持品牌植入和产品展示',
    },
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'tutorial',
    name: '教程项目',
    description: '用于创建教学和培训内容',
    icon: GraduationCap,
    type: 'script',
    category: 'education',
    features: ['步骤清晰', '知识结构化', '互动提示'],
    presetConfig: {
      description: '用于创建教程内容，支持步骤清晰展示和知识结构化',
    },
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'novel-romance',
    name: '言情小说项目',
    description: '适用于言情小说创作',
    icon: BookOpen,
    type: 'novel',
    category: 'content',
    features: ['角色关系图', '情感线追踪', '章节模板'],
    presetConfig: {
      description: '适用于言情小说创作，支持角色关系图和情感线追踪',
    },
    gradient: 'from-purple-500 to-pink-500',
    popular: true,
  },
  {
    id: 'novel-fantasy',
    name: '奇幻小说项目',
    description: '适用于奇幻、科幻小说创作',
    icon: Layers,
    type: 'novel',
    category: 'content',
    features: ['世界观设定', '魔法体系', '种族管理'],
    presetConfig: {
      description: '适用于奇幻、科幻小说创作，支持世界观设定和魔法体系管理',
    },
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'vlog',
    name: 'Vlog项目',
    description: '用于个人vlog和日常记录',
    icon: Camera,
    type: 'script',
    category: 'video',
    features: ['日常记录', '时间线', '地点标记'],
    presetConfig: {
      description: '用于个人vlog制作，支持时间线和地点标记',
    },
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'drama',
    name: '剧情片项目',
    description: '适用于剧情片和电影制作',
    icon: Clapperboard,
    type: 'script',
    category: 'video',
    features: ['分镜头脚本', '场记功能', '拍摄计划'],
    presetConfig: {
      description: '用于剧情片制作，支持分镜头脚本和场记功能',
    },
    gradient: 'from-violet-500 to-purple-500',
  },
];

export const QUICK_CREATE_TEMPLATES = PROJECT_TEMPLATES.filter(t => t.quickCreate);

export const POPULAR_TEMPLATES = PROJECT_TEMPLATES.filter(t => t.popular);

export const getTemplateById = (id: string): ProjectTemplate | undefined => {
  return PROJECT_TEMPLATES.find(t => t.id === id);
};
