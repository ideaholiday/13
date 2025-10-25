import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth-api';
import { User } from '@/lib/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  getUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const { access_token } = await authApi.login(credentials);
        set({ token: access_token, isAuthenticated: true });
        await get().getUser();
      },

      register: async (data) => {
        await authApi.register(data);
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null, token: null, isAuthenticated: false });
      },

      getUser: async () => {
        if (!get().token) return;
        try {
          const user = await authApi.getUser();
          set({ user });
        } catch (error) {
          // Token might be invalid, log out
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
