import { createContext, useContext, useState, useEffect, ReactNode, createElement } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'findermeister_token';

const AuthService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async register(data: any) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const result = await response.json();
    this.setToken(result.token);
    return result;
  },

  async login(data: any) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const result = await response.json();
    this.setToken(result.token);
    return result;
  },

  async getCurrentUser() {
    const response = await fetch('/api/auth/me', {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    return response.json();
  },

  logout(): void {
    this.clearToken();
    // Force immediate redirect to prevent any flash of content
    window.location.replace('/');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => AuthService.getCurrentUser(),
    enabled: AuthService.isAuthenticated(),
    retry: false,
  });

  useEffect(() => {
    console.log('Auth effect triggered:', { data, error, isLoading });
    if (data) {
      console.log('Setting user from auth data:', data.user);
      setUser(data.user);
      setProfile(data.profile);
    } else if (error) {
      console.error('Auth error, clearing token:', error);
      AuthService.clearToken();
      setUser(null);
      setProfile(null);
    }
  }, [data, error]);

  const login = async (email: string, password: string) => {
    const response = await AuthService.login({ email, password });
    setUser(response.user);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  };

  const register = async (data: any) => {
    const response = await AuthService.register(data);
    setUser(response.user);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  };

  const logout = () => {
    // Clear state immediately
    setUser(null);
    setProfile(null);
    queryClient.clear();
    // Clear token and redirect
    AuthService.logout();
  };

  const authValue = {
    user,
    profile,
    isLoading: isLoading && AuthService.isAuthenticated(),
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return createElement(AuthContext.Provider, { value: authValue }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}