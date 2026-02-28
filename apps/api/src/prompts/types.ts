export interface PromptStyle {
  name: string;
  keywords: string[];
  qualityModifiers: string[];
  lighting: string[];
  negative: string[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  systemPrompt: string;
  userPromptTemplate?: string;
  variables?: PromptVariable[];
  metadata?: PromptMetadata;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export type PromptCategory = 
  | 'agent'
  | 'route'
  | 'service'
  | 'template'
  | 'style';

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  defaultValue?: any;
}

export interface PromptMetadata {
  author?: string;
  tags?: string[];
  examples?: string[];
  notes?: string;
}

export interface AgentPromptConfig {
  systemPrompt: string;
  userPromptTemplate: string;
  refinePrompt?: string;
  variationPrompt?: string;
}

export interface PolishPromptConfig {
  image: string;
  video: string;
  character: string;
}

export interface StyleTemplateConfig {
  name: string;
  keywords: string[];
  qualityModifiers: string[];
  lighting: string[];
  negative: string[];
}
