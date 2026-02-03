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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Sign In</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            disabled={isSubmitting}
          />
          {errors.email && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {errors.email.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            disabled={isSubmitting}
          />
          {errors.password && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {errors.password.message}
            </span>
          )}
        </div>

        {apiError && (
          <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>
            {apiError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};
