import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SignupPage } from './SignupPage';
import { IAuthContext } from '../contexts/AuthContext';
import * as AuthContextModule from '../contexts/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/**
 * Unit tests for SignupPage component
 * Requirements: 4.1, 1.7, 4.6
 */
describe('SignupPage - Unit Tests', () => {
  const mockSignup = vi.fn();

  const mockAuthContext: IAuthContext = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    signin: vi.fn(),
    signup: mockSignup,
    logout: vi.fn(),
    checkAuth: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue(mockAuthContext);
  });

  const renderSignupPage = () => {
    return render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
  };

  it('renders signup form correctly', () => {
    renderSignupPage();

    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('displays validation errors for invalid email', async () => {
    renderSignupPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for short name', async () => {
    renderSignupPage();
    const user = userEvent.setup();

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'ab');
    await user.tab();

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for short password', async () => {
    renderSignupPage();
    const user = userEvent.setup();

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'short');
    await user.tab();

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for password without special character', async () => {
    renderSignupPage();
    const user = userEvent.setup();

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'Password123');
    await user.tab();

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one letter, one number, and one special character/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data successfully', async () => {
    mockSignup.mockResolvedValue(undefined);
    renderSignupPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(nameInput, 'Test User');
    await user.type(passwordInput, 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      });
    });
  });

  it('displays API error when signup fails', async () => {
    const errorMessage = 'Email already exists';
    mockSignup.mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    renderSignupPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(nameInput, 'Test User');
    await user.type(passwordInput, 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays generic error message when API error has no message', async () => {
    mockSignup.mockRejectedValue(new Error('Network error'));

    renderSignupPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(nameInput, 'Test User');
    await user.type(passwordInput, 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/registration failed. please try again/i)).toBeInTheDocument();
    });
  });

  it('disables form inputs and button while submitting', async () => {
    mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderSignupPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up/i }) as HTMLButtonElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(nameInput, 'Test User');
    await user.type(passwordInput, 'Password123!');

    await user.click(submitButton);

    // Check that inputs are disabled during submission
    expect(emailInput.disabled).toBe(true);
    expect(nameInput.disabled).toBe(true);
    expect(passwordInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
    expect(screen.getByText(/signing up.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled();
    });
  });

  it('handles array of error messages from API', async () => {
    const errorMessages = ['Email is invalid', 'Password is too weak'];
    mockSignup.mockRejectedValue({
      response: {
        data: {
          message: errorMessages,
        },
      },
    });

    renderSignupPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(nameInput, 'Test User');
    await user.type(passwordInput, 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessages.join(', '))).toBeInTheDocument();
    });
  });
});
