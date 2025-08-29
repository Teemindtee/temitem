
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import Login from '@/pages/auth/login';
import Landing from '@/pages/landing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mock wouter
jest.mock('wouter', () => ({
  useLocation: () => ['/login', jest.fn()],
  useRoute: () => [true, {}],
  Router: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('UI Component Tests', () => {
  describe('Button Component', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('handles click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
      render(<Button disabled>Disabled button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Input Component', () => {
    it('renders input field', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('handles input changes', async () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test input');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('shows error state', () => {
      render(<Input className="border-red-500" />);
      expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
    });
  });

  describe('Landing Page', () => {
    it('renders landing page elements', () => {
      render(
        <TestWrapper>
          <Landing />
        </TestWrapper>
      );

      expect(screen.getByText(/FinderMeister/i)).toBeInTheDocument();
    });

    it('has navigation links', () => {
      render(
        <TestWrapper>
          <Landing />
        </TestWrapper>
      );

      expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
    });
  });

  describe('Login Page', () => {
    it('renders login form', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });
});
