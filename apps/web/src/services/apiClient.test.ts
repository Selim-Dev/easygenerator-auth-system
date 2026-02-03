import { describe, it, expect, beforeEach } from 'vitest';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

describe('API Client Interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Request Interceptor Logic', () => {
    // Simulate the request interceptor logic
    const requestInterceptor = (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };

    it('should attach Bearer token from localStorage to request headers', () => {
      const token = 'test-jwt-token';
      localStorage.setItem('auth_token', token);

      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not add Authorization header when no token exists', () => {
      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should not modify config when headers are undefined', () => {
      const token = 'test-jwt-token';
      localStorage.setItem('auth_token', token);

      const config: any = {};

      const result = requestInterceptor(config);

      expect(result).toBe(config);
      expect(result.headers).toBeUndefined();
    });
  });

  describe('Response Interceptor Logic', () => {
    // Simulate the response success interceptor
    const responseInterceptor = (response: AxiosResponse) => {
      return response;
    };

    // Simulate the response error interceptor
    const responseErrorInterceptor = (error: any) => {
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          localStorage.removeItem('auth_token');
        }
        
        return Promise.reject({
          status,
          message: error.response.data?.message || 'An error occurred',
          data: error.response.data,
        });
      } else if (error.request) {
        return Promise.reject({
          status: 0,
          message: 'Unable to connect to server',
          data: null,
        });
      } else {
        return Promise.reject({
          status: 0,
          message: error.message || 'An unexpected error occurred',
          data: null,
        });
      }
    };

    it('should pass through successful responses', () => {
      const response: AxiosResponse = {
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const result = responseInterceptor(response);

      expect(result).toBe(response);
    });

    it('should handle 401 errors by clearing token', async () => {
      localStorage.setItem('auth_token', 'test-token');
      
      const error: any = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      try {
        await responseErrorInterceptor(error);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(err.status).toBe(401);
        expect(err.message).toBe('Unauthorized');
      }
    });

    it('should handle server errors with structured response', async () => {
      const error: any = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };

      try {
        await responseErrorInterceptor(error);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Internal server error');
        expect(err.data).toEqual(error.response.data);
      }
    });

    it('should handle network errors when no response received', async () => {
      const error: any = {
        request: {},
        message: 'Network Error',
      };

      try {
        await responseErrorInterceptor(error);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.status).toBe(0);
        expect(err.message).toBe('Unable to connect to server');
        expect(err.data).toBeNull();
      }
    });

    it('should handle unexpected errors', async () => {
      const error: any = {
        message: 'Unexpected error',
      };

      try {
        await responseErrorInterceptor(error);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.status).toBe(0);
        expect(err.message).toBe('Unexpected error');
        expect(err.data).toBeNull();
      }
    });

    it('should use default message when error response has no message', async () => {
      const error: any = {
        response: {
          status: 400,
          data: {},
        },
      };

      try {
        await responseErrorInterceptor(error);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.message).toBe('An error occurred');
      }
    });

    it('should not clear token for non-401 errors', async () => {
      localStorage.setItem('auth_token', 'test-token');
      
      const error: any = {
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
      };

      try {
        await responseErrorInterceptor(error);
      } catch (err: any) {
        // Token should still be present
        expect(localStorage.getItem('auth_token')).toBe('test-token');
      }
    });
  });
});
