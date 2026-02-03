import * as fc from 'fast-check';
import { hashPassword, verifyPassword } from './password.util';

describe('Password Utility - Property Tests', () => {
  // Feature: easygenerator-auth-system, Property 7: Password Hashing Round Trip
  describe('Property 7: Password Hashing Round Trip', () => {
    it(
      'should hash and verify any password correctly',
      async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (password) => {
            // Hash the password
            const hash = await hashPassword(password);

            // Verify the hash starts with bcrypt prefix
            expect(hash).toMatch(/^\$2[aby]\$/);

            // Verify the original password matches the hash
            const isMatch = await verifyPassword(password, hash);
            expect(isMatch).toBe(true);

            // Verify a different password does not match
            const differentPassword = password + 'x';
            const isNotMatch = await verifyPassword(differentPassword, hash);
            expect(isNotMatch).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    },
    30000,
  ); // 30 second timeout for 100 bcrypt operations
  });
});
