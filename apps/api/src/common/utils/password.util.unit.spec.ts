import { hashPassword, verifyPassword } from './password.util';

describe('Password Utility - Unit Tests', () => {
  describe('hashPassword', () => {
    it('should produce bcrypt format hash with $2a$, $2b$, or $2y$ prefix', async () => {
      const password = 'testPassword123!';
      const hash = await hashPassword(password);

      // Verify hash starts with bcrypt prefix
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'samePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Hashes should be different due to different salts
      expect(hash1).not.toBe(hash2);
    });

    it('should throw error when hashing fails', async () => {
      // Test with invalid input that might cause bcrypt to fail
      // Note: bcrypt is quite robust, so we test error handling structure
      const invalidInput = null as any;

      await expect(hashPassword(invalidInput)).rejects.toThrow(
        'Failed to hash password',
      );
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'correctPassword123!';
      const hash = await hashPassword(password);

      const isMatch = await verifyPassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const correctPassword = 'correctPassword123!';
      const incorrectPassword = 'wrongPassword456!';
      const hash = await hashPassword(correctPassword);

      const isMatch = await verifyPassword(incorrectPassword, hash);

      expect(isMatch).toBe(false);
    });

    it('should return false for empty password against valid hash', async () => {
      const password = 'validPassword123!';
      const hash = await hashPassword(password);

      const isMatch = await verifyPassword('', hash);

      expect(isMatch).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const password = 'testPassword123!';
      const invalidHash = 'not-a-valid-bcrypt-hash';

      // bcrypt.compare returns false for invalid hash format
      const isMatch = await verifyPassword(password, invalidHash);

      expect(isMatch).toBe(false);
    });
  });
});
