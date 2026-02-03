import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from '../services/authApi';
import { User, SigninData, SignupData } from '../types';

// Mock the authApi
vi.mock('../services/authApi', () => ({
  authApi: {
    signin: vi.fn(),
    signup: vi.fn(),
    getMe: vi.fn(),
  },
}));

describe('AuthContext Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('signin', () => {
    it('should update state and store token on successful signin', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockToken = 'mock-jwt-token';
      const signinData: SigninData = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(authApi.signin).mockResolvedValue({ access_token: mockToken });
      vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Wait for initial checkAuth to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Perform signin
      await act(async () => {
        await result.current.signin(signinData);
      });

      // Verify state updated
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('auth_token')).toBe(mockToken);
      expect(authApi.signin).toHaveBeenCalledWith(signinData);
      expect(authApi.getMe).toHaveBeenCalled();
    });

    it('should throw error on failed signin', async () => {
      const signinData: SigninData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      vi.mocked(authApi.signin).mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify signin throws error
      await expect(
        act(async () => {
          await result.current.signin(signinData);
        })
      ).rejects.toThrow('Invalid credentials');

      // Verify state not updated
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('signup', () => {
    it('should call signup API without updating state', async () => {
      const mockUser: User = {
        id: '123',
        email: 'newuser@example.com',
        name: 'New User',
      };
      const signupData: SignupData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'Password123!',
      };

      vi.mocked(authApi.signup).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Perform signup
      await act(async () => {
        await result.current.signup(signupData);
      });

      // Verify API called
      expect(authApi.signup).toHaveBeenCalledWith(signupData);

      // Verify state NOT updated (signup doesn't auto-signin)
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should throw error on failed signup', async () => {
      const signupData: SignupData = {
        email: 'existing@example.com',
        name: 'User',
        password: 'Password123!',
      };

      vi.mocked(authApi.signup).mockRejectedValue(new Error('Email already exists'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify signup throws error
      await expect(
        act(async () => {
          await result.current.signup(signupData);
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('should clear state and remove token', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockToken = 'mock-jwt-token';

      // Setup authenticated state
      localStorage.setItem('auth_token', mockToken);
      vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Wait for checkAuth to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Perform logout
      act(() => {
        result.current.logout();
      });

      // Verify state cleared
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('should set user state when valid token exists', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockToken = 'valid-token';

      localStorage.setItem('auth_token', mockToken);
      vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Wait for checkAuth to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify authenticated state
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(authApi.getMe).toHaveBeenCalled();
    });

    it('should clear token when API returns error', async () => {
      const mockToken = 'invalid-token';

      localStorage.setItem('auth_token', mockToken);
      vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Wait for checkAuth to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify unauthenticated state
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should not call API when no token exists', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Wait for checkAuth to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify API not called
      expect(authApi.getMe).not.toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});
