import { Role, Currency } from '@prisma/client';
import { authService } from './auth.service';
import prisma from '../../lib/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken } from '../../utils/jwt';
import { createUniqueSlug } from '../../utils/slug';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../../utils/errors';

// Mock dependencies
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    store: {
      create: jest.fn(),
    },
    storeSettings: {
      create: jest.fn(),
    },
    storeMember: {
      create: jest.fn(),
    },
    deliverySlot: {
      createMany: jest.fn(),
    },
    deliveryZone: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../utils/password');
jest.mock('../../utils/jwt');
jest.mock('../../utils/slug');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;
const mockGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;
const mockCreateUniqueSlug = createUniqueSlug as jest.MockedFunction<typeof createUniqueSlug>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+1234567890',
      storeName: 'Test Store',
      storeAddress: '123 Test Street',
      storeLatitude: 40.7128,
      storeLongitude: -74.006,
      storePhone: '+0987654321',
      storeLogo: 'https://example.com/logo.png',
      currency: 'EUR' as Currency,
      acceptsCash: true,
      acceptsTransfer: false,
      minAdvanceHours: 2,
      maxAdvanceDays: 7,
      immediateCancelMinutes: 30,
      scheduledCancelHours: 24,
      deliverySlots: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', maxOrdersPerHour: 5 },
      ],
      deliveryZones: [
        { name: 'Zone 1', maxDistance: 10, deliveryFee: 5, minOrder: 15 },
      ],
    };

    it('should throw ConflictError if email already exists', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      });

      await expect(authService.register(validRegisterData))
        .rejects.toThrow(ConflictError);
      await expect(authService.register(validRegisterData))
        .rejects.toThrow('Email already registered');
    });

    it('should create user, store, and related entities on successful registration', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
      };

      const mockStore = {
        id: 'store-123',
        name: 'Test Store',
        slug: 'test-store',
        currency: 'EUR',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      mockCreateUniqueSlug.mockResolvedValue('test-store');
      mockHashPassword.mockResolvedValue('hashed-password');
      mockGenerateToken.mockReturnValue('jwt-token');

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          user: { create: jest.fn().mockResolvedValue(mockUser) },
          store: { create: jest.fn().mockResolvedValue(mockStore) },
          storeSettings: { create: jest.fn().mockResolvedValue({}) },
          storeMember: { create: jest.fn().mockResolvedValue({}) },
          deliverySlot: { createMany: jest.fn().mockResolvedValue({}) },
          deliveryZone: { createMany: jest.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      const result = await authService.register(validRegisterData);

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          phone: '+1234567890',
        },
        store: {
          id: 'store-123',
          name: 'Test Store',
          slug: 'test-store',
          currency: 'EUR',
        },
        token: 'jwt-token',
      });

      expect(mockHashPassword).toHaveBeenCalledWith('password123');
      expect(mockCreateUniqueSlug).toHaveBeenCalledWith('Test Store');
      expect(mockGenerateToken).toHaveBeenCalledWith({
        userId: 'user-123',
        email: 'test@example.com',
      });
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should throw UnauthorizedError if user not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData))
        .rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginData))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedError if password is invalid', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        phone: '+1234567890',
        memberships: [],
      });
      mockComparePassword.mockResolvedValue(false);

      await expect(authService.login(loginData))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should return user data and token on successful login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        phone: '+1234567890',
        memberships: [
          {
            role: Role.OWNER,
            store: {
              id: 'store-123',
              name: 'Test Store',
              slug: 'test-store',
              currency: 'EUR',
              isActive: true,
            },
          },
        ],
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('jwt-token');

      const result = await authService.login(loginData);

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          phone: '+1234567890',
        },
        stores: [
          {
            id: 'store-123',
            name: 'Test Store',
            slug: 'test-store',
            currency: 'EUR',
            role: Role.OWNER,
            isActive: true,
          },
        ],
        token: 'jwt-token',
      });
    });
  });

  describe('getProfile', () => {
    it('should throw NotFoundError if user not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.getProfile('user-123'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return user profile with stores', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        memberships: [
          {
            role: Role.OWNER,
            store: {
              id: 'store-123',
              name: 'Test Store',
              slug: 'test-store',
              currency: 'EUR',
              isActive: true,
            },
          },
        ],
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getProfile('user-123');

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        stores: [
          {
            id: 'store-123',
            name: 'Test Store',
            slug: 'test-store',
            currency: 'EUR',
            role: Role.OWNER,
            isActive: true,
          },
        ],
      });
    });
  });

  describe('updateProfile', () => {
    it('should update and return user profile', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Updated Name',
        phone: '+9876543210',
      };

      (mockPrisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await authService.updateProfile('user-123', {
        name: 'Updated Name',
        phone: '+9876543210',
      });

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Updated Name',
        phone: '+9876543210',
      });
    });
  });

  describe('changePassword', () => {
    it('should throw NotFoundError if user not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.changePassword('user-123', 'old', 'new'))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if current password is incorrect', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        passwordHash: 'hashed-password',
      });
      mockComparePassword.mockResolvedValue(false);

      await expect(authService.changePassword('user-123', 'wrong', 'new'))
        .rejects.toThrow(BadRequestError);
      await expect(authService.changePassword('user-123', 'wrong', 'new'))
        .rejects.toThrow('Current password is incorrect');
    });

    it('should update password successfully', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        passwordHash: 'old-hash',
      });
      mockComparePassword.mockResolvedValue(true);
      mockHashPassword.mockResolvedValue('new-hash');
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await authService.changePassword('user-123', 'old', 'new');

      expect(result).toEqual({ success: true });
      expect(mockHashPassword).toHaveBeenCalledWith('new');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { passwordHash: 'new-hash' },
      });
    });
  });
});
