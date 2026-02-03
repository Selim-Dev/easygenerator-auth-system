import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SigninPage } from './SigninPage';
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
 * Unit tests for SigninPage component
 * Requirements: 4.2, 2.7, 4.6
 */
describe('SigninPage - Unit Tests', () => {
  const mockSignin = vi.fn();

  const mockAuthContext: IAuthContext = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    signin: mockSignin,
    signup: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue(mockAuthContext);
  });

  const renderSigninPage = () => {
    return render(
      <MemoryRouter>
        <SigninPage />
      </MemoryRouter>
    );
  };

  it('renders signin form correctly', () => {
    renderSigninPage();

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('displays validation error for empty password', async () => {
    renderSigninPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data successfully', async () => {
    mockSignin.mockResolvedValue(undefined);
    renderSigninPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });

  it('displays "Invalid credentials" for 401 error', async () => {
    mockSignin.mockRejectedValue({
      response: {
        status: 401,
        data: {
          message: 'Unauthorized',
        },
      },
    });

    renderSigninPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('displays API error message for non-401 errors', async () => {
    const errorMessage = 'Server error occurred';
    mockSignin.mockRejectedValue({
      response: {
        status: 500,
        data: {
          message: errorMessage,
        },
      },
    });

    renderSigninPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays generic error message when API error has no message', async () => {
    mockSignin.mockRejectedValue(new Error('Network error'));

    renderSigninPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/sign in failed. please try again/i)).toBeInTheDocument();
    });
  });

  it('disables form inputs and button while submitting', async () => {
    mockSignin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderSigninPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign in/i }) as HTMLButtonElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');

    await user.click(submitButton);

    // Check that inputs are disabled during submission
    expect(emailInput.disabled).toBe(true);
    expect(passwordInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
    expect(screen.getByText(/signing in.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSignin).toHaveBeenCalled();
    });
  });

  it('handles array of error messages from API', async () => {
    const errorMessages = ['Email is invalid', 'Password is incorrect'];
    mockSignin.mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: errorMessages,
        },
      },
    });

    renderSigninPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessages.join(', '))).toBeInTheDocument();
    });
  });

  it('clears error message on new submission', async () => {
    mockSignin.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          message: 'Unauthorized',
        },
      },
    }).mockResolvedValueOnce(undefined);

    renderSigninPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // First submission with error
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Second submission should clear error
    await user.clear(passwordInput);
    await user.type(passwordInput, 'correctpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });
});
