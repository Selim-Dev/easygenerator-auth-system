import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as authApi from './services/authApi';

/**
 * E2E tests for complete authentication flow
 * Requirements: 1.1, 2.1, 3.4, 4.4
 * Tests: signup → signin → protected access → logout flow
 */
describe('App - E2E Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('completes full authentication flow: signup → signin → protected access → logout', async () => {
    const user = userEvent.setup();

    // Mock API responses
    const mockSignupResponse = {
      id: '123',
      email: 'testuser@example.com',
      name: 'Test User',
    };

    const mockSigninResponse = {
      access_token: 'mock-jwt-token-12345',
    };

    const mockGetMeResponse = {
      id: '123',
      email: 'testuser@example.com',
      name: 'Test User',
    };

    // Spy on authApi methods
    const signupSpy = vi.spyOn(authApi.authApi, 'signup').mockResolvedValue(mockSignupResponse);
    const signinSpy = vi.spyOn(authApi.authApi, 'signin').mockResolvedValue(mockSigninResponse);
    const getMeSpy = vi.spyOn(authApi.authApi, 'getMe').mockResolvedValue(mockGetMeResponse);

    // Render the app
    render(<App />);

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Step 1: Navigate to signup page
    // App should start at root and redirect to /signin (not authenticated)
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();

    // Click on "Sign up" link
    const signupLink = screen.getByText(/sign up/i);
    await user.click(signupLink);

    // Step 2: Fill and submit signup form
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'testuser@example.com');
    await user.type(nameInput, 'Test User');
    await user.type(passwordInput, 'Password123!');

    const signupButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(signupButton);

    // Verify signup was called
    await waitFor(() => {
      expect(signupSpy).toHaveBeenCalledWith({
        email: 'testuser@example.com',
        name: 'Test User',
        password: 'Password123!',
      });
    });

    // Step 3: After successful signup, user is redirected to signin page
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });

    // Step 4: Fill and submit signin form
    const signinEmailInput = screen.getByLabelText(/email/i);
    const signinPasswordInput = screen.getByLabelText(/password/i);

    await user.type(signinEmailInput, 'testuser@example.com');
    await user.type(signinPasswordInput, 'Password123!');

    const signinButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(signinButton);

    // Verify signin was called
    await waitFor(() => {
      expect(signinSpy).toHaveBeenCalledWith({
        email: 'testuser@example.com',
        password: 'Password123!',
      });
    });

    // Verify token was stored in localStorage
    expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token-12345');

    // Verify getMe was called to fetch user data
    await waitFor(() => {
      expect(getMeSpy).toHaveBeenCalled();
    });

    // Step 5: After successful signin, user is redirected to protected /app page
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome to the application/i })).toBeInTheDocument();
    });

    // Verify user name is displayed
    expect(screen.getByText(/hello, test user!/i)).toBeInTheDocument();

    // Step 6: Click logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    // Step 7: After logout, user is redirected to signin page
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });

    // Verify token was removed from localStorage
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('redirects unauthenticated user from protected route to signin', async () => {
    // Mock getMe to fail (no valid token)
    const getMeSpy = vi.spyOn(authApi.authApi, 'getMe').mockRejectedValue(new Error('Unauthorized'));

    // Render the app
    render(<App />);

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Should be redirected to signin page
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('maintains authentication state after page refresh', async () => {
    // Set up localStorage with a token
    localStorage.setItem('auth_token', 'mock-jwt-token-12345');

    const mockGetMeResponse = {
      id: '123',
      email: 'testuser@example.com',
      name: 'Test User',
    };

    // Mock getMe to succeed
    const getMeSpy = vi.spyOn(authApi.authApi, 'getMe').mockResolvedValue(mockGetMeResponse);

    // Render the app (simulating page refresh)
    render(<App />);

    // Wait for getMe to be called (auth check happens on mount)
    await waitFor(() => {
      expect(getMeSpy).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Wait for the app page to appear (after auth check and redirect)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome to the application/i })).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify we're on the app page with user data
    expect(screen.getByText(/hello, test user!/i)).toBeInTheDocument();
  }, 15000);

  it('handles expired token by redirecting to signin', async () => {
    // Set up localStorage with an expired token
    localStorage.setItem('auth_token', 'expired-token');

    // Mock getMe to fail (expired token)
    const getMeSpy = vi.spyOn(authApi.authApi, 'getMe').mockRejectedValue({
      response: { status: 401 },
    });

    // Render the app
    render(<App />);

    // Wait for auth check to complete
    await waitFor(() => {
      expect(getMeSpy).toHaveBeenCalled();
    });

    // Should be redirected to signin page
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });

    // Token should be removed from localStorage
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('navigates between signup and signin pages', async () => {
    const user = userEvent.setup();

    // Mock getMe to fail (not authenticated)
    vi.spyOn(authApi.authApi, 'getMe').mockRejectedValue(new Error('Unauthorized'));

    // Render the app
    render(<App />);

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Should start at signin page
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();

    // Navigate to signup
    const signupLink = screen.getByText(/sign up/i);
    await user.click(signupLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    });

    // Navigate back to signin
    const signinLink = screen.getByText(/sign in/i);
    await user.click(signinLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });
  });
});
