import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should set tokens', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setTokens('test-token', 'refresh-token');
    });

    expect(result.current.token).toBe('test-token');
    expect(result.current.refreshToken).toBe('refresh-token');
  });

  it('should set rememberMe', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setRememberMe(true);
    });

    expect(result.current.rememberMe).toBe(true);
  });

  it('should set sessionExpired', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setSessionExpired(true);
    });

    expect(result.current.sessionExpired).toBe(true);
  });

  it('should clear session', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setTokens('test-token');
      result.current.setRememberMe(true);
      result.current.clearSession();
    });

    expect(result.current.token).toBe(null);
    expect(result.current.refreshToken).toBe(null);
  });
});
