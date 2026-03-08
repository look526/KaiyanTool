import { PromptTemplate } from '../types';

export class PromptRegistry {
  private static instance: PromptRegistry;
  private prompts: Map<string, PromptTemplate> = new Map();

  private constructor() {}

  static getInstance(): PromptRegistry {
    if (!PromptRegistry.instance) {
      PromptRegistry.instance = new PromptRegistry();
    }
    return PromptRegistry.instance;
  }

  register(prompt: PromptTemplate): void {
    if (this.prompts.has(prompt.id)) {
      console.warn(`Prompt with id "${prompt.id}" already exists. Overwriting.`);
    }
    this.prompts.set(prompt.id, prompt);
  }

  get(id: string): PromptTemplate | undefined {
    return this.prompts.get(id);
  }

  getAll(): PromptTemplate[] {
    return Array.from(this.prompts.values());
  }

  getByCategory(category: string): PromptTemplate[] {
    return Array.from(this.prompts.values()).filter(p => p.category === category);
  }

  render(id: string, variables: Record<string, any>): string {
    const prompt = this.get(id);
    if (!prompt) {
      throw new Error(`Prompt with id "${id}" not found`);
    }

    if (!prompt.userPromptTemplate) {
      throw new Error(`Prompt with id "${id}" has no userPromptTemplate`);
    }

    return this.interpolate(prompt.userPromptTemplate, variables);
  }

  private interpolate(template: string, vars: Record<string, any>): string {
    let result = template;

    for (const [key, value] of Object.entries(vars)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));

      const conditionalRegex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{\/if ${key}}}`, 'g');
      result = result.replace(conditionalRegex, (_match, content) => {
        return value ? content : '';
      });
    }

    const unusedVarsRegex = /\{\{[^}]+\}\}/g;
    const unusedVars = result.match(unusedVarsRegex);
    if (unusedVars) {
      console.warn(`Unused variables in template: ${unusedVars.join(', ')}`);
    }

    return result;
  }

  validateVariables(id: string, variables: Record<string, any>): { valid: boolean; errors: string[] } {
    const prompt = this.get(id);
    if (!prompt) {
      return { valid: false, errors: [`Prompt with id "${id}" not found`] };
    }

    const errors: string[] = [];

    for (const variable of prompt.variables) {
      if (variable.required && !(variable.name in variables)) {
        errors.push(`Required variable "${variable.name}" is missing`);
      }

      if (variable.name in variables) {
        const value = variables[variable.name];
        const typeValid = this.validateType(value, variable.type);
        if (!typeValid) {
          errors.push(`Variable "${variable.name}" should be of type ${variable.type}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  clear(): void {
    this.prompts.clear();
  }
}

export const promptRegistry = PromptRegistry.getInstance();