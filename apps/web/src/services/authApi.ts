import apiClient from './apiClient';
import { SignupData, SigninData, User, AuthResponse } from '../types';

export interface IAuthApi {
  signup(data: SignupData): Promise<User>;
  signin(data: SigninData): Promise<AuthResponse>;
  getMe(): Promise<User>;
}

class AuthApi implements IAuthApi {
  /**
   * Register a new user
   * @param data - User registration data (email, name, password)
   * @returns User object without password
   */
  async signup(data: SignupData): Promise<User> {
    const response = await apiClient.post<User>('/auth/signup', data);
    return response.data;
  }

  /**
   * Sign in an existing user
   * @param data - User credentials (email, password)
   * @returns JWT access token
   */
  async signin(data: SigninData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signin', data);
    return response.data;
  }

  /**
   * Get current authenticated user information
   * @returns User object for the authenticated user
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }
}

// Export singleton instance
export const authApi = new AuthApi();
