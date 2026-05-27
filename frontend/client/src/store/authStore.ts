import { create } from 'zustand';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Mock users for demo
const MOCK_USERS: Record<string, { senha: string; user: User }> = {
  'docente@lab.com': {
    senha: '123456',
    user: {
      id: '1',
      nome: 'Prof. João Silva',
      email: 'docente@lab.com',
      perfil: 'docente',
      avatar: '👨‍🏫',
    },
  },
  'tecnico@lab.com': {
    senha: '123456',
    user: {
      id: '2',
      nome: 'Técnico Carlos',
      email: 'tecnico@lab.com',
      perfil: 'tecnico',
      avatar: '👨‍🔧',
    },
  },
  'admin@lab.com': {
    senha: '123456',
    user: {
      id: '3',
      nome: 'Admin Sistema',
      email: 'admin@lab.com',
      perfil: 'admin',
      avatar: '👨‍💼',
    },
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  login: async (email: string, senha: string) => {
    set({ loading: true });
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser = MOCK_USERS[email];
    
    if (mockUser && mockUser.senha === senha) {
      set({
        user: mockUser.user,
        isAuthenticated: true,
        loading: false,
      });
      localStorage.setItem('auth_user', JSON.stringify(mockUser.user));
    } else {
      set({ loading: false });
      throw new Error('Email ou senha inválidos');
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
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
  const stored = localStorage.getItem('auth_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      useAuthStore.setState({
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Failed to restore auth:', error);
    }
  }
};
