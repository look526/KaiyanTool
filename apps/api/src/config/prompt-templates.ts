export interface PromptStyle {
  name: string;
  keywords: string[];
  qualityModifiers: string[];
  lighting: string[];
  negative: string[];
}

export const STYLE_TEMPLATES: Record<string, PromptStyle> = {
  q_version_blind_box: {
    name: 'Q版盲盒风格',
    keywords: ['pop Mart', 'blind box toy style', 'chibi', '3D cartoon'],
    qualityModifiers: ['masterpiece', 'best quality', 'cute and colorful', 'extremely detailed CG', 'perfect lighting'],
    lighting: ['studio lighting', 'soft shadows', 'clean render'],
    negative: ['nsfw', 'lowres', 'bad anatomy', 'bad hands', 'text', 'error']
  },
  disney_pixar: {
    name: '皮克斯动画风格',
    keywords: ['Disney Pixar style', '3D cartoon', 'cute and colorful', 'character design'],
    qualityModifiers: ['masterpiece', 'best quality', 'high-definition photography', 'extremely detailed CG', 'perfect lighting', '8k wallpaper'],
    lighting: ['studio lighting', 'warm tones', 'cinematic lighting'],
    negative: ['nsfw', 'lowres', 'bad anatomy', 'bad hands', 'text', 'error']
  },
  anime: {
    name: '动漫风格',
    keywords: ['anime style', 'manga style', 'cel shading', 'vibrant colors'],
    qualityModifiers: ['masterpiece', 'best quality', 'extremely detailed', 'perfect composition'],
    lighting: ['anime lighting', 'cel shading', 'bright and colorful'],
    negative: ['nsfw', 'lowres', 'bad anatomy', 'bad hands', 'text', 'watermark']
  },
  realistic: {
    name: '写实风格',
    keywords: ['photorealistic', 'ultra realistic', 'highly detailed', 'professional photography'],
    qualityModifiers: ['masterpiece', 'best quality', '8k', 'ultra detailed', 'HDR'],
    lighting: ['natural lighting', 'realistic shadows', 'professional photography'],
    negative: ['nsfw', 'lowres', 'bad anatomy', 'bad hands', 'text', 'watermark', 'artist name']
  },
  cinematic: {
    name: '电影质感',
    keywords: ['cinematic', 'movie quality', 'professional lighting', 'dramatic composition'],
    qualityModifiers: ['masterpiece', 'best quality', 'extremely detailed CG', 'perfect lighting', '8k wallpaper', 'cinema4d', 'octane render'],
    lighting: ['cinematic lighting', 'dramatic shadows', 'professional color grading'],
    negative: ['nsfw', 'lowres', 'bad anatomy', 'bad hands', 'text', 'watermark', 'artist name']
  },
  three_view_character: {
    name: '三视图角色设计',
    keywords: [
      '(three views of character:1.2)',
      '(three views of same character in same outfit:1.2)',
      'full body',
      'front view',
      'side view',
      'back view',
      'character turnaround sheet',
      'arranged in a row'
    ],
    qualityModifiers: ['masterpiece', 'best quality', 'extremely detailed CG', 'perfect lighting', 'clean edges', 'consistent proportions'],
    lighting: ['studio lighting', 'flat lighting', 'neutral illumination'],
    negative: ['nsfw', 'lowres', 'bad anatomy', 'bad hands', 'text', 'error', 'missing fingers', 'extra digit']
  },
  orthographic: {
    name: '正交投影（建模参考）',
    keywords: [
      'orthographic projection',
      'three-view drawing',
      'T-pose',
      'grid layout',
      'front, side, back views',
      'professional character design sheet',
      'line art'
    ],
    qualityModifiers: ['masterpiece', 'best quality', 'clean lines', 'consistent proportions', 'technical drawing'],
    lighting: ['flat lighting', 'no shadows', 'neutral illumination'],
    negative: ['nsfw', 'lowres', 'bad anatomy', 'bad hands', 'text', 'error', 'shading', 'gradient']
  },
  cyberpunk: {
    name: '赛博朋克风格',
    keywords: ['cyberpunk style', 'neon lights', 'futuristic', 'high tech', 'sci-fi'],
    qualityModifiers: ['masterpiece', 'best quality', 'cinema4d', 'octane render', '8k wallpaper', 'highly detailed'],
    lighting: ['neon lighting', 'cyberpunk glow', 'dark atmosphere', 'dramatic lighting'],
    negative: ['nsfw', 'lowres', 'bad anatomy', 'bad hands', 'text', 'watermark']
  }
};

export const DEFAULT_NEGATIVE_PROMPT = [
  'nsfw',
  'lowres',
  'bad anatomy',
  'bad hands',
  'text',
  'error',
  'missing fingers',
  'extra digit',
  'fewer digits',
  'cropped',
  'worst quality',
  'low quality',
  'normal quality',
  'jpeg artifacts',
  'signature',
  'watermark',
  'username',
  'blurry',
  'artist name',
  'monochrome',
  'grayscale',
  'skin spots',
  'acnes',
  'skin blemishes',
  'age spot',
  'ugly',
  'duplicate',
  'morbid',
  'mutilated',
  'tranny',
  'mutated hands',
  'poorly drawn hands'
].join(', ');

export function buildStylePrompt(
  basePrompt: string,
  style: string,
  isThreeView: boolean = false
): { prompt: string; negativePrompt: string } {
  const styleTemplate = STYLE_TEMPLATES[style] || STYLE_TEMPLATES.cinematic;
  
  const parts: string[] = [];
  
  if (isThreeView) {
    parts.push(...STYLE_TEMPLATES.three_view_character.keywords);
  }
  
  parts.push(...styleTemplate.keywords);
  parts.push(basePrompt);
  parts.push(...styleTemplate.qualityModifiers);
  parts.push(...styleTemplate.lighting);
  
  return {
    prompt: parts.join(', '),
    negativePrompt: [...DEFAULT_NEGATIVE_PROMPT, ...styleTemplate.negative].join(', ')
  };
}

export function buildThreeViewPrompt(
  character: string,
  style: string = 'q_version_blind_box'
): string {
  const styleTemplate = STYLE_TEMPLATES[style] || STYLE_TEMPLATES.q_version_blind_box;
  
  const parts: string[] = [
    ...STYLE_TEMPLATES.three_view_character.keywords,
    character,
    ...styleTemplate.keywords,
    ...styleTemplate.qualityModifiers,
    ...styleTemplate.lighting,
    'simple background',
    'white background'
  ];
  
  return parts.join(', ');
}

export function buildCharacterImagePrompt(
  character: string,
  scene?: string,
  action?: string,
  camera?: string,
  style: string = 'cinematic'
): string {
  const styleTemplate = STYLE_TEMPLATES[style] || STYLE_TEMPLATES.cinematic;
  
  const parts: string[] = [];
  
  if (character) {
    parts.push(`Character: ${character}`);
  }
  
  if (scene) {
    parts.push(`Scene: ${scene}`);
  }
  
  if (action) {
    parts.push(`Action: ${action}`);
  }
  
  if (camera) {
    parts.push(`Camera: ${camera}`);
  }
  
  parts.push(...styleTemplate.keywords);
  parts.push(...styleTemplate.qualityModifiers);
  parts.push(...styleTemplate.lighting);
  
  return parts.join(', ');
}
