/**
 * ImageSelector type definitions
 */

export type TabType = 'upload' | 'generate' | 'library';
export type ThreeViewsMode = 'separate' | 'combined';
export type ImageType = 'character' | 'scene' | 'general';

/**
 * State for ImageSelector component
 */
export interface ImageSelectorState {
  selectedImage?: string | null;
  selectedStyle?: string;
  selectedModel?: string | null;
  referenceImage?: string | null;
  threeViewsValue?: { front: string | null; side: string | null; top: string | null } | null;
  [key: string]: any;
}

/**
 * Actions for ImageSelector component
 */
export interface ImageSelectorActions {
  setSelectedImage?: (url: string | null) => void;
  setSelectedStyle?: (style: string) => void;
  setSelectedModel?: (model: string | null) => void;
  setReferenceImage?: (url: string | null) => void;
  setThreeViewsValue?: (views: { front: string | null; side: string | null; top: string | null } | null) => void;
  [key: string]: any;
}

/**
 * Props for a ImageSelector component
 */
export interface ImageSelectorProps {
  /** Current selected image URL */
  value: string | null;
  /** Callback when image changes */
  onChange: (url: string | null) => void;
  /** Project ID for asset library */
  projectId: string;
  /** Type of image being selected */
  type?: ImageType;
  /** Placeholder text when no image selected */
  placeholder?: string;
  /** Maximum file size in MB */
  maxSize?: number;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Character description for AI generation context */
  characterDescription?: string;
  /** Character gender for AI generation */
  characterGender?: string;
  /** Character age for AI generation */
  characterAge?: number;
  /** Enable reference image upload */
  enableReferenceImage?: boolean;
  /** Enable batch image generation */
  enableMultipleGeneration?: boolean;
  /** Enable three-view generation for characters */
  enableThreeViews?: boolean;
  /** Mode for three-view generation */
  threeViewsMode?: ThreeViewsMode;
  /** Current three-view values */
  threeViewsValue?: { front: string | null; side: string | null; top: string | null };
  /** Callback when three-view values change */
  onThreeViewsChange?: (views: { front: string | null; side: string | null; top: string | null }) => void;
  /** Automatically filter by category based on type */
  autoCategoryFilter?: boolean;
  /** 打开弹窗时默认激活的标签页 */
  defaultTab?: TabType;
}

/**
 * Category option for asset filtering
 */
export interface CategoryOption {
  value: string;
  label: string;
}

/**
 * Style option for AI generation
 */
export interface StyleOption {
  value: string;
  label: string;
}

/**
 * Asset from the library
 */
export interface Asset {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  category?: string;
  categoryLabel?: string;
  createdAt: string;
}

/**
 * View type for three-view generation
 */
export type ViewType = 'front' | 'side' | 'top';

/**
 * Mapping of style values to display names
 */
export const STYLE_NAMES: Record<string, string> = {
  cinematic: '电影',
  anime: '动漫',
  realistic: '写实',
  illustration: '插画',
  watercolor: '水彩',
  '3d': '3D 建模',
  cartoon: '卡通',
  comic: '漫画',
  fantasy: '奇幻',
  scifi: '科幻',
  steampunk: '蒸汽朋克',
  cyberpunk: '赛博朋克',
};

/**
 * Mapping of types to categories
 */
export const TYPE_TO_CATEGORY: Record<ImageType, string> = {
  character: 'character',
  scene: 'scene',
  general: 'all'
};

/**
 * Available style options for AI generation
 */
export const STYLE_OPTIONS: StyleOption[] = [
  { value: 'cinematic', label: '电影' },
  { value: 'anime', label: '动漫' },
  { value: 'realistic', label: '写实' },
  { value: 'illustration', label: '插画' },
  { value: 'watercolor', label: '水彩' },
  { value: '3d', label: '3D 建模' },
  { value: 'cartoon', label: '卡通' },
  { value: 'comic', label: '漫画' },
  { value: 'fantasy', label: '奇幻' },
  { value: 'scifi', label: '科幻' },
  { value: 'steampunk', label: '蒸汽朋克' },
  { value: 'cyberpunk', label: '赛博朋克' },
];
