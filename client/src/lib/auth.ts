import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'finder' | 'admin';
  isVerified: boolean;
  isBanned: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'finder';
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private static TOKEN_KEY = 'findermeister_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', data);
    const result = await response.json();
    
    this.setToken(result.token);
    return result;
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', data);
    const result = await response.json();
    
    this.setToken(result.token);
    return result;
  }

  static async getCurrentUser(): Promise<{ user: User; profile?: any }> {
    const response = await fetch('/api/auth/me', {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    return response.json();
  }

  static logout(): void {
    this.clearToken();
    window.location.href = '/';
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
