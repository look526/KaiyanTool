export interface CanvasNode {
  id: string;
  type: 'text' | 'image' | 'video';
  position_x: number;
  position_y: number;
  content: { text?: string; url?: string; file?: File };
  output_url?: string;
  is_starred?: boolean;
  labels?: string[];
  history?: NodeHistoryEntry[];
  config?: Record<string, any>;
  is_generating?: boolean;
  generation_progress?: number;
}

export interface CanvasEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
}

export interface NodeHistoryEntry {
  content: any;
  output_url?: string;
  timestamp: Date;
}

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

export interface AIProvider {
  id: string;
  name: string;
  type: string;
  models: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  type?: 'chat' | 'image' | 'video';
  /** 调用 API 的 model 标识，与数据库 AIProviderModel.model_id 一致 */
  model_id?: string | null;
  capabilities?: string[];
  types?: string[];
}
