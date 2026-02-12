import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User } from '../lib/api';

const ENABLE_AUTH = false;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  rememberMe: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (ENABLE_AUTH) {
      checkAuth();
    } else {
      const mockUser: User = {
        id: 'mock-user-id',
        name: 'Mock User',
        email: 'mock@example.com',
        avatarUrl: null,
        bio: null,
        plan: 'free',
        storageUsed: BigInt(0),
        storageLimit: BigInt(1073741824),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUser(mockUser);
      setRememberMe(false);
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      setUser(response.user);
      setRememberMe(response.rememberMe || false);
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        setUser(null);
        setRememberMe(false);
      } else {
        setUser(null);
        setRememberMe(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    const response = await apiClient.login({ email, password, rememberMe });
    setUser(response.user);
    setRememberMe(response.rememberMe || false);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await apiClient.register({ name, email, password });
    setUser(response.user);
    setRememberMe(response.rememberMe || false);
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setRememberMe(false);
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      setUser(response.user);
      setRememberMe(response.rememberMe || false);
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        setUser(null);
        setRememberMe(false);
      } else {
        setUser(null);
        setRememberMe(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, rememberMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
