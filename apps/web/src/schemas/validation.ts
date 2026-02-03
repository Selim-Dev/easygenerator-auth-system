import { z } from 'zod';

/**
 * Signup validation schema matching backend SignupDto
 * Requirements: 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/,
      'Password must contain at least one letter, one number, and one special character (@$!%*#?&)'
    ),
});

/**
 * Signin validation schema matching backend SigninDto
 * Requirements: 5.1
 */
export const signinSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
