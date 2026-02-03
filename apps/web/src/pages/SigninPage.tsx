import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { signinSchema, SigninFormData } from '../schemas/validation';

/**
 * SigninPage component
 * Requirements: 4.2, 2.7, 4.6
 */
export const SigninPage: React.FC = () => {
  const navigate = useNavigate();
  const { signin } = useAuth();
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormData) => {
    setIsSubmitting(true);
    setApiError('');

    try {
      await signin(data);
      navigate('/app');
    } catch (error: any) {
      // Display 401 as "Invalid credentials"
      if (error.response?.status === 401) {
        setApiError('Invalid credentials');
      } else {
        const message = error.response?.data?.message || 'Sign in failed. Please try again.';
        setApiError(Array.isArray(message) ? message.join(', ') : message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        padding: '48px',
        maxWidth: '440px',
        width: '100%',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#667eea',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a202c',
            margin: '0 0 8px 0',
          }}>Welcome Back</h1>
          <p style={{
            color: '#718096',
            fontSize: '14px',
            margin: 0,
          }}>Sign in to your account to continue</p>
        </div>
      
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
            }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: errors.email ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '8px',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
                backgroundColor: isSubmitting ? '#f9fafb' : 'white',
              }}
              disabled={isSubmitting}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb'}
            />
            {errors.email && (
              <span style={{
                color: '#ef4444',
                fontSize: '13px',
                marginTop: '4px',
                display: 'block',
              }}>
                {errors.email.message}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: errors.password ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '8px',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
                backgroundColor: isSubmitting ? '#f9fafb' : 'white',
              }}
              disabled={isSubmitting}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb'}
            />
            {errors.password && (
              <span style={{
                color: '#ef4444',
                fontSize: '13px',
                marginTop: '4px',
                display: 'block',
              }}>
                {errors.password.message}
              </span>
            )}
          </div>

          {apiError && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: isSubmitting ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#5568d3';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#667eea';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
        }}>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0,
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '600',
            }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
