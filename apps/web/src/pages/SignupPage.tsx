import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { signupSchema, SignupFormData } from '../schemas/validation';

/**
 * SignupPage component
 * Requirements: 4.1, 1.7, 4.5, 4.6
 */
export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setApiError('');

    try {
      await signup(data);
      navigate('/signin');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(Array.isArray(message) ? message.join(', ') : message);
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a202c',
            margin: '0 0 8px 0',
          }}>Create Account</h1>
          <p style={{
            color: '#718096',
            fontSize: '14px',
            margin: 0,
          }}>Sign up to get started with your account</p>
        </div>
      
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '20px' }}>
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

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="name" style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
            }}>
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="John Doe"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: errors.name ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '8px',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
                backgroundColor: isSubmitting ? '#f9fafb' : 'white',
              }}
              disabled={isSubmitting}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = errors.name ? '#ef4444' : '#e5e7eb'}
            />
            {errors.name && (
              <span style={{
                color: '#ef4444',
                fontSize: '13px',
                marginTop: '4px',
                display: 'block',
              }}>
                {errors.name.message}
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
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '6px',
              marginBottom: 0,
            }}>
              Must be at least 8 characters with a letter, number, and special character
            </p>
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
                Creating account...
              </span>
            ) : 'Sign Up'}
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
            Already have an account?{' '}
            <Link to="/signin" style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '600',
            }}>
              Sign in
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
