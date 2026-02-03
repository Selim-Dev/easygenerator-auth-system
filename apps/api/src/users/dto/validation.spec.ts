import * as fc from 'fast-check';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SignupDto } from './signup.dto';

describe('DTO Validation Property Tests', () => {
  // Feature: easygenerator-auth-system, Property 3: Invalid Registration Data Rejected
  describe('Property 3: Invalid Registration Data Rejected', () => {
    it('should reject registration data with invalid email format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.oneof(
              fc.constant(''),
              fc.constant('notanemail'),
              fc.constant('missing@domain'),
              fc.constant('@nodomain.com'),
              fc.constant('spaces in@email.com'),
              fc.string().filter(s => !s.includes('@')),
            ),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            password: fc
              .string({ minLength: 8, maxLength: 50 })
              .filter(
                (pwd) =>
                  /[A-Za-z]/.test(pwd) &&
                  /\d/.test(pwd) &&
                  /[@$!%*#?&]/.test(pwd),
              ),
          }),
          async (invalidData) => {
            const dto = plainToInstance(SignupDto, invalidData);
            const errors = await validate(dto);

            // Should have validation errors
            expect(errors.length).toBeGreaterThan(0);

            // Should have email error
            const emailError = errors.find((e) => e.property === 'email');
            expect(emailError).toBeDefined();
            expect(emailError?.constraints).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject registration data with name shorter than 3 characters', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            name: fc.string({ maxLength: 2 }), // 0-2 chars
            password: fc
              .string({ minLength: 8, maxLength: 50 })
              .filter(
                (pwd) =>
                  /[A-Za-z]/.test(pwd) &&
                  /\d/.test(pwd) &&
                  /[@$!%*#?&]/.test(pwd),
              ),
          }),
          async (invalidData) => {
            const dto = plainToInstance(SignupDto, invalidData);
            const errors = await validate(dto);

            // Should have validation errors
            expect(errors.length).toBeGreaterThan(0);

            // Should have name error
            const nameError = errors.find((e) => e.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject registration data with password shorter than 8 characters', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            password: fc.string({ maxLength: 7 }), // 0-7 chars
          }),
          async (invalidData) => {
            const dto = plainToInstance(SignupDto, invalidData);
            const errors = await validate(dto);

            // Should have validation errors
            expect(errors.length).toBeGreaterThan(0);

            // Should have password error
            const passwordError = errors.find((e) => e.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject registration data with password missing letter', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            password: fc
              .string({ minLength: 8, maxLength: 50 })
              .filter((pwd) => /\d/.test(pwd) && /[@$!%*#?&]/.test(pwd))
              .filter((pwd) => !/[A-Za-z]/.test(pwd)), // No letters
          }),
          async (invalidData) => {
            const dto = plainToInstance(SignupDto, invalidData);
            const errors = await validate(dto);

            // Should have validation errors
            expect(errors.length).toBeGreaterThan(0);

            // Should have password error
            const passwordError = errors.find((e) => e.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject registration data with password missing number', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            password: fc
              .string({ minLength: 8, maxLength: 50 })
              .filter((pwd) => /[A-Za-z]/.test(pwd) && /[@$!%*#?&]/.test(pwd))
              .filter((pwd) => !/\d/.test(pwd)), // No numbers
          }),
          async (invalidData) => {
            const dto = plainToInstance(SignupDto, invalidData);
            const errors = await validate(dto);

            // Should have validation errors
            expect(errors.length).toBeGreaterThan(0);

            // Should have password error
            const passwordError = errors.find((e) => e.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject registration data with password missing special character', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            password: fc
              .string({ minLength: 8, maxLength: 50 })
              .filter((pwd) => /[A-Za-z]/.test(pwd) && /\d/.test(pwd))
              .filter((pwd) => !/[@$!%*#?&]/.test(pwd)), // No special chars
          }),
          async (invalidData) => {
            const dto = plainToInstance(SignupDto, invalidData);
            const errors = await validate(dto);

            // Should have validation errors
            expect(errors.length).toBeGreaterThan(0);

            // Should have password error
            const passwordError = errors.find((e) => e.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept valid registration data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            password: fc
              .string({ minLength: 8, maxLength: 50 })
              .filter(
                (pwd) =>
                  /[A-Za-z]/.test(pwd) &&
                  /\d/.test(pwd) &&
                  /[@$!%*#?&]/.test(pwd) &&
                  /^[A-Za-z\d@$!%*#?&]+$/.test(pwd), // Only allowed chars
              ),
          }),
          async (validData) => {
            const dto = plainToInstance(SignupDto, validData);
            const errors = await validate(dto);

            // Should have no validation errors
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
