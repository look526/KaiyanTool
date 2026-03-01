import { PromptStyle } from '../types';

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
    keywords: ['cinematic', 'movie quality', 'professional lighting', 'dramatic composition', 'hyper realistic', 'portrait photography'],
    qualityModifiers: ['masterpiece', 'best quality', 'extremely detailed CG', 'perfect lighting', '8k wallpaper', 'cinema4d', 'octane render', 'realistic skin texture', 'detailed pores', 'skin details', ' subsurface scattering', 'high detail face', 'detailed eyes'],
    lighting: ['cinematic lighting', 'dramatic shadows', 'professional color grading', 'natural light', 'soft light', 'rim lighting'],
    negative: ['nsfw', 'lowres', 'bad anatomy', 'bad hands', 'text', 'watermark', 'artist name', 'cartoon', 'anime', 'deformed', 'blurry']
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

export const STORYBOARD_STYLE_TEMPLATES = {
  cinematic: { 
    name: 'Cinematic', 
    prompt: 'cinematic lighting, film grain, anamorphic lens flares',
    keywords: ['cinematic', 'film', 'drama'],
    qualityModifiers: ['high quality', 'detailed', 'professional'],
    lighting: ['cinematic lighting', 'natural light', 'dramatic shadows'],
    negative: ['amateur', 'low quality', 'blurry']
  },
  anime: { 
    name: 'Anime', 
    prompt: 'anime style, cel shading, vibrant colors',
    keywords: ['anime', 'manga', 'cartoon'],
    qualityModifiers: ['clean lines', 'vibrant colors', 'detailed'],
    lighting: ['bright', 'vibrant', 'colorful'],
    negative: ['realistic', 'photorealistic', '3d']
  },
  realistic: { 
    name: 'Realistic', 
    prompt: 'photorealistic, detailed textures, natural lighting',
    keywords: ['realistic', 'photorealistic', 'natural'],
    qualityModifiers: ['high detail', 'realistic textures', 'lifelike'],
    lighting: ['natural lighting', 'soft shadows', 'realistic'],
    negative: ['cartoon', 'anime', 'stylized']
  },
  stylized: { 
    name: 'Stylized', 
    prompt: 'stylized, artistic, creative composition',
    keywords: ['stylized', 'artistic', 'creative'],
    qualityModifiers: ['artistic', 'unique', 'expressive'],
    lighting: ['artistic lighting', 'dramatic', 'moody'],
    negative: ['generic', 'plain', 'boring']
  },
};
