import { PromptVariable } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  variable: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  variable: string;
  message: string;
  code: string;
}

export class PromptVariableValidator {
  static validate(
    variables: PromptVariable[],
    provided: Record<string, any>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const variable of variables) {
      const hasValue = variable.name in provided;
      const value = provided[variable.name];

      if (variable.required && !hasValue) {
        errors.push({
          variable: variable.name,
          message: `Required variable "${variable.name}" is missing`,
          code: 'REQUIRED_MISSING'
        });
        continue;
      }

      if (hasValue) {
        const typeErrors = this.validateType(variable.name, variable.type, value);
        errors.push(...typeErrors);

        if (!variable.required && value === variable.defaultValue) {
          warnings.push({
            variable: variable.name,
            message: `Variable "${variable.name}" is using default value`,
            code: 'USING_DEFAULT'
          });
        }

        const valueWarnings = this.validateValue(variable, value);
        warnings.push(...valueWarnings);
      }
    }

    const providedKeys = new Set(Object.keys(provided));
    const definedKeys = new Set(variables.map(v => v.name));
    const unusedVars = [...providedKeys].filter(key => !definedKeys.has(key));

    if (unusedVars.length > 0) {
      warnings.push({
        variable: unusedVars.join(', '),
        message: `Unused variables provided: ${unusedVars.join(', ')}`,
        code: 'UNUSED_VARIABLES'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static validateType(
    name: string,
    expectedType: string,
    value: any
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({
            variable: name,
            message: `Variable "${name}" should be a string, got ${typeof value}`,
            code: 'TYPE_MISMATCH'
          });
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push({
            variable: name,
            message: `Variable "${name}" should be a valid number`,
            code: 'TYPE_MISMATCH'
          });
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({
            variable: name,
            message: `Variable "${name}" should be a boolean`,
            code: 'TYPE_MISMATCH'
          });
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push({
            variable: name,
            message: `Variable "${name}" should be an array`,
            code: 'TYPE_MISMATCH'
          });
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push({
            variable: name,
            message: `Variable "${name}" should be an object`,
            code: 'TYPE_MISMATCH'
          });
        }
        break;

      default:
        break;
    }

    return errors;
  }

  private static validateValue(
    variable: PromptVariable,
    value: any
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    if (variable.type === 'string' && typeof value === 'string') {
      if (value.trim() === '') {
        warnings.push({
          variable: variable.name,
          message: `Variable "${variable.name}" is an empty string`,
          code: 'EMPTY_STRING'
        });
      }
    }

    if (variable.type === 'number' && typeof value === 'number') {
      if (value < 0 && !variable.description?.includes('negative')) {
        warnings.push({
          variable: variable.name,
          message: `Variable "${variable.name}" is negative`,
          code: 'NEGATIVE_NUMBER'
        });
      }
    }

    if (variable.type === 'array' && Array.isArray(value)) {
      if (value.length === 0) {
        warnings.push({
          variable: variable.name,
          message: `Variable "${variable.name}" is an empty array`,
          code: 'EMPTY_ARRAY'
        });
      }
    }

    if (variable.type === 'object' && typeof value === 'object') {
      if (Object.keys(value).length === 0) {
        warnings.push({
          variable: variable.name,
          message: `Variable "${variable.name}" is an empty object`,
          code: 'EMPTY_OBJECT'
        });
      }
    }

    return warnings;
  }

  static getVariableSchema(variables: PromptVariable[]): Record<string, any> {
    const schema: Record<string, any> = {};

    for (const variable of variables) {
      schema[variable.name] = {
        type: variable.type,
        required: variable.required,
        description: variable.description,
        default: variable.defaultValue
      };
    }

    return schema;
  }
}