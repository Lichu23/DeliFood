import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import prisma from '../../src/lib/prisma';
import { hashPassword } from '../../src/utils/password';
import { generateToken } from '../../src/utils/jwt';

// Mock prisma
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    store: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    storeSettings: {
      create: jest.fn(),
    },
    storeMember: {
      create: jest.fn(),
      findFirst: jest.fn(),
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

// Mock password utils
jest.mock('../../src/utils/password');
jest.mock('../../src/utils/slug', () => ({
  createSlug: jest.fn().mockReturnValue('test-store'),
  createUniqueSlug: jest.fn().mockResolvedValue('test-store'),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

const app = createTestApp();

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 401 for wrong password', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        phone: '+1234567890',
        memberships: [],
      });

      const { comparePassword } = await import('../../src/utils/password');
      (comparePassword as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should return 200 with token for valid credentials', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        phone: '+1234567890',
        memberships: [
          {
            role: 'OWNER',
            store: {
              id: 'store-123',
              name: 'Test Store',
              slug: 'test-store',
              currency: 'EUR',
              isActive: true,
            },
          },
        ],
      });

      const { comparePassword } = await import('../../src/utils/password');
      (comparePassword as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'correctpassword',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('stores');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: '',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return profile with valid token', async () => {
      const token = generateToken({
        userId: 'user-123',
        email: 'test@example.com',
      });

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        memberships: [
          {
            role: 'OWNER',
            store: {
              id: 'store-123',
              name: 'Test Store',
              slug: 'test-store',
              currency: 'EUR',
              isActive: true,
            },
          },
        ],
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
    });
  });

  describe('PATCH /api/auth/profile', () => {
    it('should update profile with valid data', async () => {
      const token = generateToken({
        userId: 'user-123',
        email: 'test@example.com',
      });

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      (mockPrisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Updated Name',
        phone: '+9876543210',
      });

      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          phone: '+9876543210',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password with valid credentials', async () => {
      const token = generateToken({
        userId: 'user-123',
        email: 'test@example.com',
      });

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'old-hash',
      });

      const { comparePassword } = await import('../../src/utils/password');
      (comparePassword as jest.Mock).mockResolvedValue(true);
      mockHashPassword.mockResolvedValue('new-hash');
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for incorrect current password', async () => {
      const token = generateToken({
        userId: 'user-123',
        email: 'test@example.com',
      });

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'old-hash',
      });

      const { comparePassword } = await import('../../src/utils/password');
      (comparePassword as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Current password is incorrect');
    });
  });
});

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.environment).toBe('test');
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Route not found');
  });
});
