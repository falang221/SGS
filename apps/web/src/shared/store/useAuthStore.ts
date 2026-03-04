import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'DIRECTEUR' | 'ENSEIGNANT' | 'COMPTABLE' | 'PARENT' | 'STUDENT';
  tenantId: string;
}

interface AuthState {
  user: User | null;
  tenantId: string | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenantId: null,
      accessToken: null,
      setAuth: (user, token) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('tenantId', user.tenantId);
        set({ user, accessToken: token, tenantId: user.tenantId });
      },
      logout: () => {
        localStorage.clear();
        set({ user: null, accessToken: null, tenantId: null });
      },
    }),
    { name: 'auth-storage' }
  )
);
