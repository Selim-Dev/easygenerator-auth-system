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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Sign Up</h1>
      
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
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            disabled={isSubmitting}
          />
          {errors.name && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {errors.name.message}
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
          {isSubmitting ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  );
};
