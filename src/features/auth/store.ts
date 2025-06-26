import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import { User } from '@/types'; // Import the single source of truth

export type AuthCredentials = {
  username?: string;
  password?: string;
};

interface AuthStoreState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      login: async (credentials) => {
        await api.auth.login(credentials);
        await get().checkSession();
      },
      logout: async () => {
        try {
          await api.auth.logout();
        } catch (error) {
          console.error("Backend logout failed, proceeding with client-side cleanup.", error);
        } finally {
          set({ user: null });
        }
      },
      checkSession: async () => {
        set({ isLoading: true });
        try {
          const response = await api.auth.getSession();
          if (response && response.success && response.user) {
            set({ user: response.user, isLoading: false });
          } else {
            set({ user: null, isLoading: false });
          }
        } catch (error) {
          console.error("Session check failed, logging out.", error);
          set({ user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 