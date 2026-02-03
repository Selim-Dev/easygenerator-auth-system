import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthProvider, IAuthContext } from '../contexts/AuthContext';
import * as AuthContextModule from '../contexts/AuthContext';

// Mock the useAuth hook
const mockUseAuth = vi.fn();

vi.spyOn(AuthContextModule, 'useAuth').mockImplementation(() => mockUseAuth());

describe('ProtectedRoute Unit Tests', () => {
  it('should redirect to /signin when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      signin: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    } as IAuthContext);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route path="/signin" element={<div>Signin Page</div>} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to signin page
    expect(screen.getByText('Signin Page')).toBeTruthy();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('should render children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
      signin: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    } as IAuthContext);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route path="/signin" element={<div>Signin Page</div>} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Should display protected content
    expect(screen.getByText('Protected Content')).toBeTruthy();
    expect(screen.queryByText('Signin Page')).toBeNull();
  });

  it('should show loading spinner while checking auth', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      signin: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    } as IAuthContext);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route path="/signin" element={<div>Signin Page</div>} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Should display loading state
    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.queryByText('Protected Content')).toBeNull();
    expect(screen.queryByText('Signin Page')).toBeNull();
  });
});
