import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { apiClient, User } from '../../lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  rememberMe: boolean;
  sessionExpired: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setRememberMe: (rememberMe: boolean) => void;
  setSessionExpired: (expired: boolean) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearSessionExpired: () => void;
}

const ENABLE_AUTH = true;

const initialState: AuthState = {
  user: null,
  loading: true,
  rememberMe: false,
  sessionExpired: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setUser: (user) => set({ user }),
        setLoading: (loading) => set({ loading }),
        setRememberMe: (rememberMe) => set({ rememberMe }),
        setSessionExpired: (sessionExpired) => set({ sessionExpired }),

        clearSessionExpired: () => set({ sessionExpired: false }),

        checkAuth: async () => {
          if (!ENABLE_AUTH) {
            const mockUser: User = {
              id: 'mock-user-id',
              name: 'Mock User',
              email: 'mock@example.com',
              avatarUrl: null,
              bio: null,
              role: 'user',
              plan: 'free',
              storageUsed: BigInt(0),
              storageLimit: BigInt(1073741824),
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            set({ user: mockUser, loading: false });
            return;
          }

          try {
            const response = await apiClient.getCurrentUser();
            set({
              user: response.user,
              rememberMe: response.rememberMe || false,
              loading: false,
            });
          } catch {
            set({ user: null, rememberMe: false, loading: false });
          }
        },

        login: async (email, password, rememberMe) => {
          const response = await apiClient.login({ email, password, rememberMe });
          set({ user: response.user, rememberMe: rememberMe || false });
        },

        register: async (name, email, password) => {
          const response = await apiClient.register({ name, email, password });
          set({ user: response.user, rememberMe: false });
        },

        logout: async () => {
          try {
            await apiClient.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            set({ user: null, rememberMe: false });
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberMe');
          }
        },

        refreshUser: async () => {
          try {
            const response = await apiClient.getCurrentUser();
            set({
              user: response.user,
              rememberMe: response.rememberMe || false,
            });
          } catch {
            set({ user: null, rememberMe: false });
          }
        },
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
    user: store.user,
    loading: store.loading,
    rememberMe: store.rememberMe,
    sessionExpired: store.sessionExpired,
    login: store.login,
    register: store.register,
    logout: store.logout,
    refreshUser: store.refreshUser,
    clearSessionExpired: store.clearSessionExpired,
  };
};
