export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'script' | 'novel' | 'storyline' | 'outline';

export interface AIProviderModel {
  id: string;
  name: string;
  model_id?: string | null;
  provider_id?: string;
  provider_type?: string;
  types: string[];
  description?: string;
  capabilities?: string[];
}

export interface ModelSelectorProps {
  content_type: ContentType;
  value?: string;
  on_change: (model_id: string) => void;
  /** 无选中且模型列表加载完成后，自动选中「默认」或列表第一项 */
  auto_select_when_empty?: boolean;
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
