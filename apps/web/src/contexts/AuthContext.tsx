import { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, User, setAuthErrorHandler } from '../lib/api';
import { useAuth as useAuthStore } from '../core/store/auth.store';
import { useCurrentUser } from '../modules/auth/hooks';
import { queryKeys } from '../core/api/query-keys';

const ENABLE_AUTH = true;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  rememberMe: boolean;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: userData, isLoading: userLoading, refetch } = useCurrentUser();
  const { rememberMe, sessionExpired, setRememberMe, setSessionExpired, setTokens, logout: storeLogout, clearSession } = useAuthStore();
  
  const user = userData?.user || null;
  const loading = userLoading;

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, [setSessionExpired]);

  const handleAuthError = useCallback(() => {
    clearSession();
    setSessionExpired(true);
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
  }, [clearSession, setSessionExpired]);

  useEffect(() => {
    setAuthErrorHandler(handleAuthError);
  }, [handleAuthError]);

  useEffect(() => {
    if (sessionExpired) {
      navigate('/login', { replace: true });
    }
  }, [sessionExpired, navigate]);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    await apiClient.login({ email, password, remember_me: rememberMe });
    await refetch();
    navigate('/projects');
  };
 
  const register = async (name: string, email: string, password: string) => {
    await apiClient.register({ name, email, password });
    await refetch();
    navigate('/projects');
  };

  const logout = async () => {
    await storeLogout();
    refetch();
  };

  const refreshUser = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      refreshUser, 
      rememberMe, 
      sessionExpired, 
      clearSessionExpired 
    }}>
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
