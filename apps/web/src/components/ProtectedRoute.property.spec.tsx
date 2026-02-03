import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as fc from 'fast-check';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import { authApi } from '../services/authApi';
import { User } from '../types';

// Mock the authApi
vi.mock('../services/authApi', () => ({
  authApi: {
    signin: vi.fn(),
    signup: vi.fn(),
    getMe: vi.fn(),
  },
}));

describe('Property 11: Protected Route Access Control', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // Feature: easygenerator-auth-system, Property 11: Protected Route Access Control
  it('should grant access to /app with valid token and redirect without token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          email: fc.emailAddress(),
          name: fc.string({ minLength: 3, maxLength: 50 }),
        }),
        fc.string({ minLength: 20, maxLength: 100 }), // JWT token
        async (user: User, token: string) => {
          // Test 1: With valid token - should grant access
          localStorage.setItem('auth_token', token);
          vi.mocked(authApi.getMe).mockResolvedValue(user);

          const { unmount } = render(
            <MemoryRouter initialEntries={['/app']}>
              <AuthProvider>
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
              </AuthProvider>
            </MemoryRouter>
          );

          // Wait for auth check to complete
          await waitFor(() => {
            expect(screen.queryByText('Loading...')).toBeNull();
          }, { timeout: 3000 });

          // Should display protected content
          expect(screen.getByText('Protected Content')).toBeTruthy();
          expect(screen.queryByText('Signin Page')).toBeNull();

          unmount();
          localStorage.clear();
          vi.clearAllMocks();

          // Test 2: Without token - should redirect to signin
          const { unmount: unmount2 } = render(
            <MemoryRouter initialEntries={['/app']}>
              <AuthProvider>
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
              </AuthProvider>
            </MemoryRouter>
          );

          // Wait for auth check to complete
          await waitFor(() => {
            expect(screen.queryByText('Loading...')).toBeNull();
          }, { timeout: 3000 });

          // Should redirect to signin page
          expect(screen.getByText('Signin Page')).toBeTruthy();
          expect(screen.queryByText('Protected Content')).toBeNull();

          unmount2();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  // Feature: easygenerator-auth-system, Property 11: Protected Route Access Control
  it('should redirect to signin when token is invalid or expired', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 20, maxLength: 100 }), // Invalid/expired token
        async (invalidToken: string) => {
          localStorage.setItem('auth_token', invalidToken);
          vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'));

          const { unmount } = render(
            <MemoryRouter initialEntries={['/app']}>
              <AuthProvider>
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
              </AuthProvider>
            </MemoryRouter>
          );

          // Wait for auth check to complete
          await waitFor(() => {
            expect(screen.queryByText('Loading...')).toBeNull();
          }, { timeout: 3000 });

          // Should redirect to signin page
          expect(screen.getByText('Signin Page')).toBeTruthy();
          expect(screen.queryByText('Protected Content')).toBeNull();

          // Token should be cleared from localStorage
          expect(localStorage.getItem('auth_token')).toBeNull();

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});
