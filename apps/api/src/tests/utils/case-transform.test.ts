import { transformKeysToSnake, transformKeysToCamel, toSnake, toCamel } from '../../utils/case-transform';

describe('Case Transform Utilities', () => {
  describe('toSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnake('apiKey')).toBe('api_key');
      expect(toSnake('baseUrl')).toBe('base_url');
      expect(toSnake('referenceImages')).toBe('reference_images');
      expect(toSnake('userId')).toBe('user_id');
    });

    it('should handle already snake_case strings', () => {
      expect(toSnake('api_key')).toBe('api_key');
      expect(toSnake('base_url')).toBe('base_url');
    });

    it('should handle consecutive uppercase letters', () => {
      expect(toSnake('XMLHttpRequest')).toBe('_x_m_l_http_request');
      expect(toSnake('getURL')).toBe('get_u_r_l');
    });

    it('should handle single word', () => {
      expect(toSnake('user')).toBe('user');
      expect(toSnake('name')).toBe('name');
    });
  });

  describe('toCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamel('api_key')).toBe('apiKey');
      expect(toCamel('base_url')).toBe('baseUrl');
      expect(toCamel('reference_images')).toBe('referenceImages');
      expect(toCamel('user_id')).toBe('userId');
    });

    it('should handle already camelCase strings', () => {
      expect(toCamel('apiKey')).toBe('apiKey');
      expect(toCamel('baseUrl')).toBe('baseUrl');
    });

    it('should handle multiple underscores', () => {
      expect(toCamel('get_url_path')).toBe('getUrlPath');
      expect(toCamel('user_profile_id')).toBe('userProfileId');
    });
  });

  describe('transformKeysToSnake', () => {
    it('should transform simple object keys', () => {
      const input = { apiKey: 'xxx', baseUrl: 'yyy' };
      const result = transformKeysToSnake(input);
      expect(result).toEqual({ api_key: 'xxx', base_url: 'yyy' });
    });

    it('should transform nested object keys', () => {
      const input = { user: { userId: '123', profile: { firstName: 'John' } } };
      const result = transformKeysToSnake(input);
      expect(result).toEqual({
        user: { user_id: '123', profile: { first_name: 'John' } }
      });
    });

    it('should transform array elements', () => {
      const input = { items: [{ itemId: '1' }, { itemId: '2' }] };
      const result = transformKeysToSnake(input);
      expect(result).toEqual({ items: [{ item_id: '1' }, { item_id: '2' }] });
    });

    it('should handle null and undefined', () => {
      expect(transformKeysToSnake(null)).toBeNull();
      expect(transformKeysToSnake(undefined)).toBeUndefined();
    });

    it('should handle primitive values', () => {
      expect(transformKeysToSnake('string')).toBe('string');
      expect(transformKeysToSnake(123)).toBe(123);
      expect(transformKeysToSnake(true)).toBe(true);
    });

    it('should handle empty object', () => {
      expect(transformKeysToSnake({})).toEqual({});
    });

    it('should handle arrays of primitives', () => {
      expect(transformKeysToSnake([1, 2, 3])).toEqual([1, 2, 3]);
      expect(transformKeysToSnake(['a', 'b'])).toEqual(['a', 'b']);
    });
  });

  describe('transformKeysToCamel', () => {
    it('should transform simple object keys', () => {
      const input = { api_key: 'xxx', base_url: 'yyy' };
      const result = transformKeysToCamel(input);
      expect(result).toEqual({ apiKey: 'xxx', baseUrl: 'yyy' });
    });

    it('should transform nested object keys', () => {
      const input = { user: { user_id: '123', profile: { first_name: 'John' } } };
      const result = transformKeysToCamel(input);
      expect(result).toEqual({
        user: { userId: '123', profile: { firstName: 'John' } }
      });
    });

    it('should transform array elements', () => {
      const input = { items: [{ item_id: '1' }, { item_id: '2' }] };
      const result = transformKeysToCamel(input);
      expect(result).toEqual({ items: [{ itemId: '1' }, { itemId: '2' }] });
    });

    it('should handle null and undefined', () => {
      expect(transformKeysToCamel(null)).toBeNull();
      expect(transformKeysToCamel(undefined)).toBeUndefined();
    });

    it('should handle mixed case keys', () => {
      const input = { user_id: '123', userName: 'John' };
      const result = transformKeysToCamel(input);
      expect(result).toEqual({ userId: '123', userName: 'John' });
    });
  });

  describe('Round-trip transformation', () => {
    it('should be reversible (snake -> camel -> snake)', () => {
      const original = { api_key: 'xxx', user_id: '123' };
      const camelResult = transformKeysToCamel(original);
      const backToSnake = transformKeysToSnake(camelResult);
      expect(backToSnake).toEqual(original);
    });

    it('should be reversible (camel -> snake -> camel)', () => {
      const original = { apiKey: 'xxx', userId: '123' };
      const snakeResult = transformKeysToSnake(original);
      const backToCamel = transformKeysToCamel(snakeResult);
      expect(backToCamel).toEqual(original);
    });
  });
});
