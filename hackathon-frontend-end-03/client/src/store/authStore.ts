import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  login: async (email: string, senha: string) => {
    set({ loading: true });

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const json = await res.json();

    if (!json.success) {
      set({ loading: false });
      throw new Error(json.message || 'Credenciais inválidas');
    }

    const { token, user } = json.data as { token: string; user: User };

    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    set({ user, isAuthenticated: true, loading: false });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },
}));

// Initialize auth from localStorage
export const initializeAuth = () => {
  const storedUser  = localStorage.getItem('auth_user');
  const storedToken = localStorage.getItem('auth_token');
  if (storedUser && storedToken) {
    try {
      const user = JSON.parse(storedUser) as User;
      useAuthStore.setState({
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Failed to restore auth:', error);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
  }
};
