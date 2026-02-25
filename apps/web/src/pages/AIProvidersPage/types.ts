import { LucideIcon } from 'lucide-react';

export interface AIProviderModel {
  id: string;
  name: string;
  modelId: string;
  types: string[];
  description?: string;
  capabilities: string[];
  enabled: boolean;
  isAssistantDefault?: boolean;
}

export interface AIProvider {
  id: string;
  type: string;
  apiKey: string;
  baseUrl: string | null;
  enabled: boolean;
  models: AIProviderModel[];
  createdAt: string;
  updatedAt: string;
}

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
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
}

export interface ModelFormData {
  name: string;
  modelId: string;
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
}

export interface ModelModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  modelFormData: ModelFormData;
  onModelFormDataChange: (data: ModelFormData) => void;
  saving: boolean;
  isEdit: boolean;
}
