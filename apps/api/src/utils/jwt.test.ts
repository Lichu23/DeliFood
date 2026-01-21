import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, generateInvitationToken, TokenPayload } from './jwt';

// The env module is loaded with test values from tests/setup.ts
const TEST_SECRET = 'test-jwt-secret-for-testing';

describe('JWT Utils', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload: TokenPayload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include payload data in token', () => {
      const payload: TokenPayload = {
        userId: 'user-456',
        email: 'another@example.com',
      };

      const token = generateToken(payload);
      const decoded = jwt.verify(token, TEST_SECRET) as TokenPayload & { iat: number; exp: number };

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should set expiration time', () => {
      const payload: TokenPayload = {
        userId: 'user-789',
        email: 'expire@example.com',
      };

      const token = generateToken(payload);
      const decoded = jwt.verify(token, TEST_SECRET) as { exp: number; iat: number };

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('verifyToken', () => {
    it('should verify and return payload from valid token', () => {
      const payload: TokenPayload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);
      const result = verifyToken(token);

      expect(result.userId).toBe(payload.userId);
      expect(result.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        verifyToken('not.a.valid.jwt.token');
      }).toThrow();
    });

    it('should throw error for token with wrong secret', () => {
      const token = jwt.sign({ userId: 'test', email: 'test@test.com' }, 'wrong-secret');

      expect(() => {
        verifyToken(token);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      const token = jwt.sign(
        { userId: 'test', email: 'test@test.com' },
        TEST_SECRET,
        { expiresIn: '-1s' } // Already expired
      );

      expect(() => {
        verifyToken(token);
      }).toThrow();
    });
  });

  describe('generateInvitationToken', () => {
    it('should generate a valid invitation token', () => {
      const token = generateInvitationToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include type and timestamp in payload', () => {
      const token = generateInvitationToken();
      const decoded = jwt.verify(token, TEST_SECRET) as { type: string; timestamp: number };

      expect(decoded.type).toBe('invitation');
      expect(decoded.timestamp).toBeDefined();
      expect(typeof decoded.timestamp).toBe('number');
    });

    it('should generate unique tokens each time', () => {
      const token1 = generateInvitationToken();
      const token2 = generateInvitationToken();

      expect(token1).not.toBe(token2);
    });

    it('should have 7-day expiration', () => {
      const token = generateInvitationToken();
      const decoded = jwt.verify(token, TEST_SECRET) as { exp: number; iat: number };

      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const expDiff = decoded.exp - decoded.iat;

      expect(expDiff).toBe(sevenDaysInSeconds);
    });
  });
});
