import { describe, it, expect } from 'vitest';
import { signupSchema, signinSchema } from './validation';

/**
 * Unit tests for Zod validation schemas
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
describe('Signup Schema Validation', () => {
  describe('Valid inputs', () => {
    it('should accept valid signup data', () => {
      const validData = {
        email: 'user@example.com',
        name: 'John Doe',
        password: 'Password123!',
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept minimal valid data', () => {
      const validData = {
        email: 'a@b.co',
        name: 'abc',
        password: 'Pass123!',
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept password with all special characters', () => {
      const validData = {
        email: 'test@test.com',
        name: 'Test User',
        password: 'Abc123@$!%*#?&',
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Email validation', () => {
    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'notanemail',
        name: 'John Doe',
        password: 'Password123!',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email format');
      }
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        name: 'John Doe',
        password: 'Password123!',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email format');
      }
    });

    it('should reject email without domain', () => {
      const invalidData = {
        email: 'user@',
        name: 'John Doe',
        password: 'Password123!',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Name validation', () => {
    it('should reject name shorter than 3 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        name: 'ab',
        password: 'Password123!',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at least 3 characters');
      }
    });

    it('should reject empty name', () => {
      const invalidData = {
        email: 'user@example.com',
        name: '',
        password: 'Password123!',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at least 3 characters');
      }
    });

    it('should accept name with exactly 3 characters', () => {
      const validData = {
        email: 'user@example.com',
        name: 'abc',
        password: 'Password123!',
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Password validation', () => {
    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        name: 'John Doe',
        password: 'Pass12!',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Password must be at least 8 characters');
      }
    });

    it('should reject password without letter', () => {
      const invalidData = {
        email: 'user@example.com',
        name: 'John Doe',
        password: '12345678!',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Password must contain');
      }
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'user@example.com',
        name: 'John Doe',
        password: 'Password!',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Password must contain');
      }
    });

    it('should reject password without special character', () => {
      const invalidData = {
        email: 'user@example.com',
        name: 'John Doe',
        password: 'Password123',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Password must contain');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'user@example.com',
        name: 'John Doe',
        password: '',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Password must be at least 8 characters');
      }
    });

    it('should accept password with exactly 8 characters meeting all requirements', () => {
      const validData = {
        email: 'user@example.com',
        name: 'John Doe',
        password: 'Pass123!',
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Multiple validation errors', () => {
    it('should report all validation errors', () => {
      const invalidData = {
        email: 'invalid',
        name: 'ab',
        password: 'short',
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(1);
      }
    });
  });
});

describe('Signin Schema Validation', () => {
  describe('Valid inputs', () => {
    it('should accept valid signin data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'anypassword',
      };

      const result = signinSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept minimal valid data', () => {
      const validData = {
        email: 'a@b.co',
        password: 'p',
      };

      const result = signinSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Email validation', () => {
    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'notanemail',
        password: 'password',
      };

      const result = signinSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email format');
      }
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password',
      };

      const result = signinSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Password validation', () => {
    it('should reject empty password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '',
      };

      const result = signinSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Password is required');
      }
    });

    it('should accept any non-empty password', () => {
      const validData = {
        email: 'user@example.com',
        password: 'x',
      };

      const result = signinSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
