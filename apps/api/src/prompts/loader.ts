import logger from '../lib/logger';
import {
  PromptTemplate,
  PromptCategory,
} from './types';

class PromptLoader {
  private cache: Map<string, PromptTemplate> = new Map();

  initialize(templates: PromptTemplate[]): void {
    templates.forEach(template => {
      this.cache.set(template.id, template);
    });
    logger.info(`PromptLoader initialized with ${templates.length} templates`);
  }

  get(id: string): PromptTemplate | undefined {
    return this.cache.get(id);
  }

  getByCategory(category: PromptCategory): PromptTemplate[] {
    return Array.from(this.cache.values()).filter(
      template => template.category === category
    );
  }

  getAll(): PromptTemplate[] {
    return Array.from(this.cache.values());
  }

  render(
    templateId: string,
    variables: Record<string, any>
  ): { systemPrompt: string; userPrompt?: string } {
    const template = this.get(templateId);
    if (!template) {
      throw new Error(`Prompt template not found: ${templateId}`);
    }

    let systemPrompt = template.systemPrompt;
    let userPrompt = template.userPromptTemplate;

    const replaceVariables = (text: string): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        if (variables[key] === undefined) {
          const varConfig = template.variables?.find(v => v.name === key);
          if (varConfig?.defaultValue !== undefined) {
            return String(varConfig.defaultValue);
          }
          logger.warn(`Missing variable: ${key} in template: ${templateId}`);
          return `{{${key}}}`;
        }
        return String(variables[key]);
      });
    };

    systemPrompt = replaceVariables(systemPrompt);
    if (userPrompt) {
      userPrompt = replaceVariables(userPrompt);
    }

    return { systemPrompt, userPrompt };
  }

  validateVariables(
    templateId: string,
    variables: Record<string, any>
  ): { valid: boolean; missing: string[] } {
    const template = this.get(templateId);
    if (!template) {
      return { valid: false, missing: [templateId] };
    }

    const missing: string[] = [];
    template.variables?.forEach(variable => {
      if (variable.required && variables[variable.name] === undefined) {
        missing.push(variable.name);
      }
    });

    return { valid: missing.length === 0, missing };
  }
}

export const promptLoader = new PromptLoader();
