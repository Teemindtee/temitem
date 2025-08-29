
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

// Mock fetch
global.fetch = jest.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('React Hooks Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  describe('useAuth Hook', () => {
    it('initializes with no user', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('loads user from token in localStorage', async () => {
      // Mock token in localStorage
      localStorage.setItem('token', 'mock-token');

      // Mock successful API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'client'
          }
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      expect(result.current.user?.email).toBe('test@example.com');
    });

    it('handles login correctly', async () => {
      // Mock successful login response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'client'
          },
          token: 'mock-token'
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        result.current.login('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      expect(localStorage.getItem('token')).toBe('mock-token');
    });

    it('handles logout correctly', () => {
      // Set initial token
      localStorage.setItem('token', 'mock-token');

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      result.current.logout();

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('handles failed login', async () => {
      // Mock failed login response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Invalid credentials'
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      try {
        await result.current.login('wrong@example.com', 'wrongpassword');
      } catch (error) {
        expect(error).toBeDefined();
      }

      expect(result.current.user).toBeNull();
    });
  });
});
