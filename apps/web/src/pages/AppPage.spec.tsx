import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppPage } from './AppPage';
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
 * Unit tests for AppPage component
 * Requirements: 4.3, 4.4
 */
describe('AppPage - Unit Tests', () => {
  const mockLogout = vi.fn();

  const mockAuthContext: IAuthContext = {
    user: {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    },
    isAuthenticated: true,
    isLoading: false,
    signin: vi.fn(),
    signup: vi.fn(),
    logout: mockLogout,
    checkAuth: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue(mockAuthContext);
  });

  const renderAppPage = () => {
    return render(
      <MemoryRouter>
        <AppPage />
      </MemoryRouter>
    );
  };

  it('renders page with user data', () => {
    renderAppPage();

    expect(screen.getByRole('heading', { name: /welcome to the application/i })).toBeInTheDocument();
    expect(screen.getByText(/hello, test user!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('displays user name from AuthContext', () => {
    renderAppPage();

    expect(screen.getByText(/hello, test user!/i)).toBeInTheDocument();
  });

  it('calls logout and navigates to signin when logout button is clicked', async () => {
    renderAppPage();
    const user = userEvent.setup();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });

  it('renders correctly when user is null', () => {
    const contextWithoutUser: IAuthContext = {
      ...mockAuthContext,
      user: null,
      isAuthenticated: false,
    };
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue(contextWithoutUser);

    renderAppPage();

    expect(screen.getByRole('heading', { name: /welcome to the application/i })).toBeInTheDocument();
    expect(screen.queryByText(/hello,/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});
