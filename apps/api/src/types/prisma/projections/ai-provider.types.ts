export interface AIProviderListItem {
  id: string;
  userId: string;
  type: string;
  apiKey: string;
  baseUrl: string | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIProviderWithModels extends AIProviderListItem {
  models: Array<{
    id: string;
    name: string;
    description: string | null;
    capabilities: string[];
    types: string[];
    isAssistantDefault: boolean;
  }>;
}

export interface AIProviderModelProjection {
  id: string;
  name: string;
  description: string | null;
  capabilities: string[];
  types: string[];
  isAssistantDefault: boolean;
}
