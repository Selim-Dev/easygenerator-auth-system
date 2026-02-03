import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { AuthProvider, useAuth } from './AuthContext';
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

describe('AuthContext Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // Feature: easygenerator-auth-system, Property 12: Session Persistence Across Refresh
  describe('Property 12: Session Persistence Across Refresh', () => {
    it('should maintain authentication state after refresh when valid token exists', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            email: fc.emailAddress(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
          }),
          fc.string({ minLength: 20, maxLength: 100 }), // JWT token
          async (user: User, token: string) => {
            // Clear previous state
            localStorage.clear();
            vi.clearAllMocks();

            // Setup: Store token and mock successful getMe response
            localStorage.setItem('auth_token', token);
            vi.mocked(authApi.getMe).mockResolvedValueOnce(user);

            // Simulate page refresh by creating new AuthProvider instance
            const { result, unmount } = renderHook(() => useAuth(), {
              wrapper: AuthProvider,
            });

            // Wait for checkAuth to complete
            await waitFor(
              () => {
                expect(result.current.isLoading).toBe(false);
              },
              { timeout: 1000 }
            );

            // Verify authentication state is maintained
            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.user).toEqual(user);
            expect(localStorage.getItem('auth_token')).toBe(token);

            // Cleanup
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should treat user as unauthenticated after refresh when token is invalid', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 20, maxLength: 100 }), // Invalid token
          async (invalidToken: string) => {
            // Clear previous state
            localStorage.clear();
            vi.clearAllMocks();

            // Setup: Store invalid token and mock failed getMe response
            localStorage.setItem('auth_token', invalidToken);
            vi.mocked(authApi.getMe).mockRejectedValueOnce(new Error('Unauthorized'));

            // Simulate page refresh by creating new AuthProvider instance
            const { result, unmount } = renderHook(() => useAuth(), {
              wrapper: AuthProvider,
            });

            // Wait for checkAuth to complete AND token to be cleared
            await waitFor(
              () => {
                expect(result.current.isLoading).toBe(false);
                expect(result.current.isAuthenticated).toBe(false);
                expect(result.current.user).toBeNull();
              },
              { timeout: 1000 }
            );

            // Verify token was removed from localStorage
            expect(localStorage.getItem('auth_token')).toBeNull();

            // Cleanup
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

  // Feature: easygenerator-auth-system, Property 14: Expired Token Treated as Unauthenticated
  describe('Property 14: Expired Token Treated as Unauthenticated', () => {
    it('should treat expired token as unauthenticated', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 20, maxLength: 100 }), // Expired token
          async (expiredToken: string) => {
            // Clear previous state
            localStorage.clear();
            vi.clearAllMocks();

            // Setup: Store expired token and mock 401 response
            localStorage.setItem('auth_token', expiredToken);
            vi.mocked(authApi.getMe).mockRejectedValueOnce({
              response: { status: 401, data: { message: 'Token expired' } },
            });

            // Create AuthProvider instance
            const { result, unmount } = renderHook(() => useAuth(), {
              wrapper: AuthProvider,
            });

            // Wait for checkAuth to complete AND token to be cleared
            await waitFor(
              () => {
                expect(result.current.isLoading).toBe(false);
                expect(result.current.isAuthenticated).toBe(false);
                expect(result.current.user).toBeNull();
              },
              { timeout: 1000 }
            );

            // Verify token was removed from localStorage
            expect(localStorage.getItem('auth_token')).toBeNull();

            // Cleanup
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
