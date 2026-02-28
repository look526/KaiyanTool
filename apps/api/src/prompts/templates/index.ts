import { STYLE_TEMPLATES, DEFAULT_NEGATIVE_PROMPT, STORYBOARD_STYLE_TEMPLATES } from './style-templates';

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
    negativePrompt: [...DEFAULT_NEGATIVE_PROMPT.split(', '), ...styleTemplate.negative].join(', ')
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

export { STYLE_TEMPLATES, DEFAULT_NEGATIVE_PROMPT, STORYBOARD_STYLE_TEMPLATES };
export type { PromptStyle } from '../types';
