export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'script' | 'novel' | 'storyline' | 'outline';

export interface AIProviderModel {
  id: string;
  name: string;
  types: string[];
  description?: string;
  capabilities?: string[];
}

export interface ModelSelectorProps {
  content_type: ContentType;
  value?: string;
  on_change: (model_id: string) => void;
  show_last_used?: boolean;
  show_default?: boolean;
  allow_custom?: boolean;
  on_manage_models?: () => void;
  on_refresh_models?: () => void;
  class_name?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  placeholder?: string;
}
