export interface WorkspacePromptJson {
  version: number;
  scene?: string | SceneObject;
  shot?: string | ShotObject;
  subject?: string | SubjectObject;
  props?: string[] | PropObject[];
  style?: string | StyleObject;
  audio?: string | AudioObject;
  extra?: Record<string, any>;
}

export interface SceneObject {
  id?: string;
  description?: string;
  time?: string;
  location?: string;
  atmosphere?: string;
}

export interface ShotObject {
  type?: string;
  description?: string;
  camera_movement?: string;
}

export interface SubjectObject {
  id?: string;
  role?: string;
  type?: string;
  name?: string;
  description?: string;
  position?: string;
  action?: string;
  expression?: string;
}

export interface PropObject {
  id?: string;
  description?: string;
  position?: string;
}

export interface StyleObject {
  art_style?: string;
  mood?: string;
  color_palette?: string;
  lighting?: string;
}

export interface AudioObject {
  bgm?: string;
  sfx?: string[];
}

export function buildPromptFromJson(promptJson: WorkspacePromptJson): string {
  const parts: string[] = [];

  if (typeof promptJson.scene === 'string') {
    parts.push(`场景: ${promptJson.scene}`);
  } else if (promptJson.scene?.description) {
    parts.push(`场景: ${promptJson.scene.description}`);
    if (promptJson.scene.time) parts.push(`时间: ${promptJson.scene.time}`);
    if (promptJson.scene.atmosphere) parts.push(`氛围: ${promptJson.scene.atmosphere}`);
  }

  if (typeof promptJson.shot === 'string') {
    parts.push(`镜头: ${promptJson.shot}`);
  } else if (promptJson.shot?.description) {
    parts.push(`镜头: ${promptJson.shot.description}`);
    if (promptJson.shot.camera_movement) parts.push(`镜头运动: ${promptJson.shot.camera_movement}`);
  }

  if (typeof promptJson.subject === 'string') {
    parts.push(`主体: ${promptJson.subject}`);
  } else if (promptJson.subject?.description) {
    parts.push(`主体: ${promptJson.subject.description}`);
    if (promptJson.subject.action) parts.push(`动作: ${promptJson.subject.action}`);
    if (promptJson.subject.expression) parts.push(`表情: ${promptJson.subject.expression}`);
  }

  if (Array.isArray(promptJson.props)) {
    const propsStr = promptJson.props.map(p =>
      typeof p === 'string' ? p : p.description
    ).join(', ');
    if (propsStr) parts.push(`道具: ${propsStr}`);
  }

  if (typeof promptJson.style === 'string') {
    parts.push(`风格: ${promptJson.style}`);
  } else if (promptJson.style?.art_style) {
    parts.push(`艺术风格: ${promptJson.style.art_style}`);
    if (promptJson.style.mood) parts.push(`情绪: ${promptJson.style.mood}`);
    if (promptJson.style.color_palette) parts.push(`色彩: ${promptJson.style.color_palette}`);
  }

  if (typeof promptJson.audio === 'string') {
    parts.push(`音频: ${promptJson.audio}`);
  } else if (promptJson.audio?.bgm) {
    parts.push(`背景音乐: ${promptJson.audio.bgm}`);
    if (promptJson.audio.sfx?.length) {
      parts.push(`音效: ${promptJson.audio.sfx.join(', ')}`);
    }
  }

  return parts.join('，') + '。';
}

export function isSimplePrompt(promptJson: WorkspacePromptJson): boolean {
  return (
    typeof promptJson.scene === 'string' &&
    typeof promptJson.shot === 'string' &&
    typeof promptJson.subject === 'string' &&
    (!promptJson.props || typeof promptJson.props[0] === 'string') &&
    typeof promptJson.style === 'string'
  );
}
