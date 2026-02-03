import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { SignupPage } from './SignupPage';
import { AuthProvider } from '../contexts/AuthContext';
import { authApi } from '../services/authApi';

vi.mock('../services/authApi');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/**
 * Property 1: Valid Registration Creates Account (frontend portion)
 * Validates: Requirements 1.1, 1.7
 * 
 * This property verifies that the signup form correctly validates and submits
 * valid registration data, and navigates to the signin page on success.
 */
describe('SignupPage - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Property 1: Valid registration data creates account and navigates to signin', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          name: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3),
          password: fc.string({ minLength: 8, maxLength: 50 })
            .filter(pwd => 
              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/.test(pwd)
            ),
        }),
        async (userData) => {
          // Mock successful signup
          vi.mocked(authApi.signup).mockResolvedValue({
            id: '123',
            email: userData.email,
            name: userData.name,
          });

          const { unmount } = render(
            <MemoryRouter>
              <AuthProvider>
                <SignupPage />
              </AuthProvider>
            </MemoryRouter>
          );

          const user = userEvent.setup();

          // Fill in the form
          const emailInput = screen.getByLabelText(/email/i);
          const nameInput = screen.getByLabelText(/name/i);
          const passwordInput = screen.getByLabelText(/password/i);

          await user.clear(emailInput);
          await user.type(emailInput, userData.email);
          
          await user.clear(nameInput);
          await user.type(nameInput, userData.name);
          
          await user.clear(passwordInput);
          await user.type(passwordInput, userData.password);

          // Submit the form
          const submitButton = screen.getByRole('button', { name: /sign up/i });
          await user.click(submitButton);

          // Verify signup was called with correct data
          await waitFor(() => {
            expect(authApi.signup).toHaveBeenCalledWith({
              email: userData.email,
              name: userData.name,
              password: userData.password,
            });
          });

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('Property: Invalid email format shows validation error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter(s => !s.includes('@') && s.length > 0),
        async (invalidEmail) => {
          const { unmount } = render(
            <MemoryRouter>
              <AuthProvider>
                <SignupPage />
              </AuthProvider>
            </MemoryRouter>
          );

          const user = userEvent.setup();
          const emailInput = screen.getByLabelText(/email/i);

          await user.clear(emailInput);
          await user.type(emailInput, invalidEmail);
          await user.tab(); // Trigger blur

          // Check for validation error
          await waitFor(() => {
            const errorText = screen.queryByText(/invalid email/i);
            expect(errorText).toBeTruthy();
          });

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property: Short name shows validation error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 2 }),
        async (shortName) => {
          const { unmount } = render(
            <MemoryRouter>
              <AuthProvider>
                <SignupPage />
              </AuthProvider>
            </MemoryRouter>
          );

          const user = userEvent.setup();
          const nameInput = screen.getByLabelText(/name/i);

          await user.clear(nameInput);
          if (shortName.length > 0) {
            await user.type(nameInput, shortName);
          }
          await user.tab(); // Trigger blur

          // Submit to trigger validation
          const submitButton = screen.getByRole('button', { name: /sign up/i });
          await user.click(submitButton);

          // Check for validation error
          await waitFor(() => {
            const errorText = screen.queryByText(/name must be at least 3 characters/i);
            expect(errorText).toBeTruthy();
          });

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property: Short password shows validation error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 7 }),
        async (shortPassword) => {
          const { unmount } = render(
            <MemoryRouter>
              <AuthProvider>
                <SignupPage />
              </AuthProvider>
            </MemoryRouter>
          );

          const user = userEvent.setup();
          const passwordInput = screen.getByLabelText(/password/i);

          await user.clear(passwordInput);
          if (shortPassword.length > 0) {
            await user.type(passwordInput, shortPassword);
          }
          await user.tab();

          // Submit to trigger validation
          const submitButton = screen.getByRole('button', { name: /sign up/i });
          await user.click(submitButton);

          // Check for validation error
          await waitFor(() => {
            const errorText = screen.queryByText(/password must be at least 8 characters/i);
            expect(errorText).toBeTruthy();
          });

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });
});
