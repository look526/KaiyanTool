import { ProjectTemplate } from './constants';

export interface ProjectFormData {
  name: string;
  description: string;
  type: 'script' | 'novel' | 'mixed';
  aspectRatio: '16:9' | '9:16';
  style: string;
}

export interface CreateProjectPageProps {
  onProjectCreated?: (projectId: string) => void;
}

export interface ProjectTemplateSelectorProps {
  templates: ProjectTemplate[];
  selectedTemplate: ProjectTemplate | null;
  onTemplateSelect: (template: ProjectTemplate) => void;
  showQuickCreate?: boolean;
}

export interface QuickCreateButtonProps {
  template: ProjectTemplate;
  onClick: () => void;
}
