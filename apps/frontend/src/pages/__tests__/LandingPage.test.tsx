import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../context/AuthContext';
import LandingPage from '../LandingPage';

vi.mock('../../../api/auth', () => ({
  fetchCurrentUser: vi.fn().mockResolvedValue(null),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  verifyEmail: vi.fn()
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('LandingPage', () => {
  it('renders the primary call to action', () => {
    render(<LandingPage />, { wrapper });
    expect(screen.getByText('Steganography My Image')).toBeInTheDocument();
  });
});
