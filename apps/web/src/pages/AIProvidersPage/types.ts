import type { AIProvider, AIProviderModel } from '../../types';
import type { LucideIcon } from 'lucide-react';

export type { AIProvider, AIProviderModel };

export interface ProviderType {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

export interface ContentType {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export interface ProviderFormData {
  type: string;
  api_key: string;
  base_url: string;
  enabled: boolean;
}

export interface ModelFormData {
  name: string;
  model_id: string;
  types: string[];
  description: string;
  capabilities: string[];
  enabled: boolean;
}

export interface ProviderCardProps {
  provider: AIProvider;
  isExpanded: boolean;
  isApiKeyVisible: boolean;
  isAdmin: boolean;
  onToggleExpand: (id: string) => void;
  onToggleApiKeyVisibility: (id: string) => void;
  onEdit: (provider: AIProvider) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onAddModel: (provider: AIProvider) => void;
  onEditModel: (provider: AIProvider, model: AIProviderModel) => void;
  onDeleteModel: (provider: AIProvider, model: AIProviderModel) => void;
  onTestModel: (modelId: string) => void;
  onSetAssistantDefault: (modelId: string) => void;
  onUnsetAssistantDefault: (modelId: string) => void;
  testingProvider: string | null;
  testingModel: string | null;
  isMobile: boolean;
  isTablet: boolean;
  isDark?: boolean;
  colors?: {
    bgPrimary: string;
    bgSecondary: string;
    bgGlass: string;
    bgGlassHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderHover: string;
  };
  accentColor?: string;
}

export interface ProviderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  formData: ProviderFormData;
  onFormDataChange: (data: ProviderFormData) => void;
  saving: boolean;
  isEdit?: boolean;
  isMobile: boolean;
  isDark?: boolean;
  colors?: {
    bgPrimary: string;
    bgSecondary: string;
    bgGlass: string;
    bgGlassHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderHover: string;
  };
  accentColor?: string;
}

export interface ModelModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  modelFormData: ModelFormData;
  onModelFormDataChange: (data: ModelFormData) => void;
  saving: boolean;
  isEdit: boolean;
  providerType: string;
  isDark?: boolean;
  colors?: {
    bgPrimary: string;
    bgSecondary: string;
    bgGlass: string;
    bgGlassHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderHover: string;
  };
  accentColor?: string;
}
