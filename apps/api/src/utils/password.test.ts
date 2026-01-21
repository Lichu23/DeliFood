import { hashPassword, comparePassword } from './password';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for different passwords', async () => {
      const hash1 = await hashPassword('password1');
      const hash2 = await hashPassword('password2');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle special characters', async () => {
      const password = 'p@$$w0rd!#%^&*()_+';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it('should handle unicode characters', async () => {
      const password = 'contraseña密码';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);

      const result = await comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should handle empty password comparison', async () => {
      const hash = await hashPassword('');

      const result = await comparePassword('', hash);

      expect(result).toBe(true);
    });

    it('should return false for empty password against non-empty hash', async () => {
      const hash = await hashPassword('realPassword');

      const result = await comparePassword('', hash);

      expect(result).toBe(false);
    });

    it('should handle special characters correctly', async () => {
      const password = 'p@$$w0rd!#%^&*()_+';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword';
      const hash = await hashPassword(password);

      const result = await comparePassword('testpassword', hash);

      expect(result).toBe(false);
    });
  });
});
