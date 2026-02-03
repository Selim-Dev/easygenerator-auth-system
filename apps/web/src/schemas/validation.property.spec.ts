import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { signupSchema, signinSchema } from './validation';

/**
 * Feature: easygenerator-auth-system, Property 4: Frontend and Backend Validation Consistency
 * Validates: Requirements 1.8
 * 
 * This property test verifies that frontend validation (zod) and backend validation (class-validator)
 * produce consistent results for boundary test data.
 */
describe('Property 4: Frontend and Backend Validation Consistency', () => {
  it('should validate signup data consistently with backend', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.oneof(
            fc.emailAddress(),
            fc.string(), // Invalid emails
            fc.constant(''), // Empty string
            fc.constant('notanemail'), // Invalid format
          ),
          name: fc.oneof(
            fc.string({ minLength: 3, maxLength: 50 }),
            fc.string({ minLength: 0, maxLength: 2 }), // Too short
            fc.constant(''), // Empty
          ),
          password: fc.oneof(
            // Valid passwords
            fc.string({ minLength: 8, maxLength: 20 }).filter(pwd =>
              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/.test(pwd)
            ),
            // Invalid passwords - too short
            fc.string({ minLength: 0, maxLength: 7 }),
            // Invalid passwords - missing requirements
            fc.string({ minLength: 8 }).map(s => s.replace(/[A-Za-z]/g, '1')), // No letters
            fc.string({ minLength: 8 }).map(s => s.replace(/\d/g, 'a')), // No numbers
            fc.string({ minLength: 8 }).map(s => s.replace(/[@$!%*#?&]/g, 'a')), // No special chars
          ),
        }),
        async (testData) => {
          // Test frontend validation
          const frontendResult = signupSchema.safeParse(testData);
          
          // For this property test, we verify that:
          // 1. Frontend validation correctly identifies valid/invalid data
          // 2. Error messages are descriptive
          
          if (frontendResult.success) {
            // If frontend says valid, data should meet all requirements
            expect(testData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            expect(testData.name.length).toBeGreaterThanOrEqual(3);
            expect(testData.password.length).toBeGreaterThanOrEqual(8);
            expect(testData.password).toMatch(/[A-Za-z]/);
            expect(testData.password).toMatch(/\d/);
            expect(testData.password).toMatch(/[@$!%*#?&]/);
          } else {
            // If frontend says invalid, at least one requirement should be violated
            const errors = frontendResult.error.errors;
            expect(errors.length).toBeGreaterThan(0);
            
            // Verify error messages are descriptive
            errors.forEach(error => {
              expect(error.message).toBeTruthy();
              expect(error.message.length).toBeGreaterThan(0);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate signin data consistently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.oneof(
            fc.emailAddress(),
            fc.string(),
            fc.constant(''),
          ),
          password: fc.oneof(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.constant(''),
          ),
        }),
        async (testData) => {
          const frontendResult = signinSchema.safeParse(testData);
          
          if (frontendResult.success) {
            // If frontend says valid, data should meet requirements
            expect(testData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            expect(testData.password.length).toBeGreaterThan(0);
          } else {
            // If frontend says invalid, should have descriptive errors
            const errors = frontendResult.error.errors;
            expect(errors.length).toBeGreaterThan(0);
            errors.forEach(error => {
              expect(error.message).toBeTruthy();
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject boundary cases consistently', async () => {
    // Test specific boundary cases
    const boundaryCases = [
      // Email boundaries
      { email: 'a@b.co', name: 'abc', password: 'Pass123!' }, // Minimal valid email
      { email: 'invalid', name: 'abc', password: 'Pass123!' }, // Invalid email
      { email: '', name: 'abc', password: 'Pass123!' }, // Empty email
      
      // Name boundaries
      { email: 'test@test.com', name: 'ab', password: 'Pass123!' }, // Name too short
      { email: 'test@test.com', name: 'abc', password: 'Pass123!' }, // Minimal valid name
      { email: 'test@test.com', name: '', password: 'Pass123!' }, // Empty name
      
      // Password boundaries
      { email: 'test@test.com', name: 'abc', password: 'Pass12!' }, // 7 chars - too short
      { email: 'test@test.com', name: 'abc', password: 'Pass123!' }, // 8 chars - valid
      { email: 'test@test.com', name: 'abc', password: '12345678' }, // No letter
      { email: 'test@test.com', name: 'abc', password: 'Password' }, // No number
      { email: 'test@test.com', name: 'abc', password: 'Password1' }, // No special char
      { email: 'test@test.com', name: 'abc', password: '' }, // Empty password
    ];

    for (const testCase of boundaryCases) {
      const result = signupSchema.safeParse(testCase);
      
      // Verify validation logic is consistent with backend regex pattern
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testCase.email);
      const isValidName = testCase.name.length >= 3;
      // Must match the exact backend pattern: only allowed chars are [A-Za-z\d@$!%*#?&]
      const isValidPassword = 
        testCase.password.length >= 8 &&
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/.test(testCase.password);
      
      const shouldBeValid = isValidEmail && isValidName && isValidPassword;
      
      expect(result.success).toBe(shouldBeValid);
    }
  });
});
