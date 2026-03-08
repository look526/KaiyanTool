import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { apiClient } from '../../lib/api';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  rememberMe: boolean;
  sessionExpired: boolean;
}

interface AuthActions {
  setTokens: (token: string, refreshToken?: string) => void;
  setRememberMe: (rememberMe: boolean) => void;
  setSessionExpired: (expired: boolean) => void;
  logout: () => Promise<void>;
  clearSession: () => void;
}

const ENABLE_AUTH = true;

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  rememberMe: false,
  sessionExpired: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setTokens: (token, refreshToken) => set({ 
          token, 
          refreshToken: refreshToken || null,
        }),
        
        setRememberMe: (rememberMe) => set({ rememberMe }),
        
        setSessionExpired: (sessionExpired) => set({ sessionExpired }),
        
        logout: async () => {
          try {
            await apiClient.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            set({ 
              token: null, 
              refreshToken: null, 
              sessionExpired: false 
            });
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberMe');
          }
        },
        
        clearSession: () => set({ 
          token: null, 
          refreshToken: null, 
          sessionExpired: false 
        }),
      }),
      {
        name: 'kaiyan-auth',
        partialize: (state) => ({
          rememberMe: state.rememberMe,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

export const useAuth = () => {
  const store = useAuthStore();
  return {
    token: store.token,
    refreshToken: store.refreshToken,
    rememberMe: store.rememberMe,
    sessionExpired: store.sessionExpired,
    isAuthenticated: !!store.token,
    setTokens: store.setTokens,
    setRememberMe: store.setRememberMe,
    setSessionExpired: store.setSessionExpired,
    logout: store.logout,
    clearSession: store.clearSession,
  };
};
