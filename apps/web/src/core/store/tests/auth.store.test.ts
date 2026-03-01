import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  bio: null,
  role: 'user' as const,
  plan: 'free' as const,
  storageUsed: BigInt(0),
  storageLimit: BigInt(1073741824),
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('../../lib/api', () => ({
  apiClient: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should have initial state', async () => {
    const { useAuthStore } = await import('../auth.store');
    
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.rememberMe).toBe(false);
  });

  it('should set user correctly', async () => {
    const { useAuthStore } = await import('../auth.store');
    
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setUser(mockUser);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(true);
  });

  it('should set loading state', async () => {
    const { useAuthStore } = await import('../auth.store');
    
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.loading).toBe(false);
  });

  it('should clear user on logout', async () => {
    const { useAuthStore } = await import('../auth.store');
    
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setUser(mockUser);
    });
    
    expect(result.current.user).toEqual(mockUser);
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
  });

  it('should set remember me', async () => {
    const { useAuthStore } = await import('../auth.store');
    
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setRememberMe(true);
    });
    
    expect(result.current.rememberMe).toBe(true);
  });

  it('should set session expired', async () => {
    const { useAuthStore } = await import('../auth.store');
    
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setSessionExpired(true);
    });
    
    expect(result.current.sessionExpired).toBe(true);
  });
});

describe('useAuth hook', () => {
  it('should expose auth state and actions', async () => {
    const { useAuth } = await import('../auth.store');
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('register');
  });
});
