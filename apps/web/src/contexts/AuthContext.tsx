import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SignupData, SigninData } from '../types';
import { authApi } from '../services/authApi';

export interface IAuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (data: SigninData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const signin = async (data: SigninData): Promise<void> => {
    const response = await authApi.signin(data);
    localStorage.setItem('auth_token', response.access_token);
    
    // Fetch user data after signin
    const userData = await authApi.getMe();
    setUser(userData);
  };

  const signup = async (data: SignupData): Promise<void> => {
    await authApi.signup(data);
    // Note: signup doesn't automatically sign in the user
  };

  const logout = (): void => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const checkAuth = async (): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: IAuthContext = {
    user,
    isAuthenticated,
    isLoading,
    signin,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
