import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export type AuthCredentials = {
  username?: string;
  password?: string;
};

export type AuthState = {
  user: User | null;
}

interface AuthStoreState {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      login: async (credentials) => {
        // Step 1: Call the login endpoint to set the HttpOnly cookie.
        await api.auth.login(credentials);
        
        // Step 2: After successful login, immediately call checkSession
        // to fetch user data and update the state.
        // This creates a single, atomic login action.
        await get().checkSession();
      },
      logout: async () => {
        try {
          // Attempt to invalidate the session on the backend.
          await api.auth.logout();
        } catch (error) {
          // Log the error but don't block the client-side logout.
          console.error("Backend logout failed, proceeding with client-side cleanup.", error);
        } finally {
          // Always clear the user from the state.
          set({ user: null });
        }
      },
      checkSession: async () => {
        try {
          const response = await api.auth.getSession();
          if (response.data?.user) {
            set({ user: response.data.user });
          } else {
            set({ user: null });
          }
        } catch (error) {
          console.error("Session check failed, logging out.", error);
          set({ user: null });
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
); 