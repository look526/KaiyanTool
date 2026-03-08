export const toSnake = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const toCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

export function transformKeysToSnake<T>(obj: T): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((item) => transformKeysToSnake(item));
  if (obj instanceof Date) return obj;
  if (obj instanceof RegExp) return obj;
  if (obj instanceof Error) return obj;
  if (typeof obj !== 'object') return obj;

  try {
    return Object.keys(obj as object).reduce((result, key) => {
      const value = (obj as Record<string, unknown>)[key];
      const snakeKey = toSnake(key);
      (result as Record<string, unknown>)[snakeKey] = transformKeysToSnake(value);
      return result;
    }, {} as Record<string, unknown>);
  } catch (error) {
    console.warn('transformKeysToSnake error:', error);
    return obj;
  }
}

export function transformKeysToCamel<T>(obj: T): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((item) => transformKeysToCamel(item));
  if (obj instanceof Date) return obj;
  if (obj instanceof RegExp) return obj;
  if (obj instanceof Error) return obj;
  if (typeof obj !== 'object') return obj;

  try {
    return Object.keys(obj as object).reduce((result, key) => {
      const value = (obj as Record<string, unknown>)[key];
      const camelKey = toCamel(key);
      (result as Record<string, unknown>)[camelKey] = transformKeysToCamel(value);
      return result;
    }, {} as Record<string, unknown>);
  } catch (error) {
    console.warn('transformKeysToCamel error:', error);
    return obj;
  }
}

export const caseTransform = {
  toSnake,
  toCamel,
  transformKeysToSnake,
  transformKeysToCamel,
};

export default caseTransform;
