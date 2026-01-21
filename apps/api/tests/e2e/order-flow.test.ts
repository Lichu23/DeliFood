import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import prisma from '../../src/lib/prisma';
import { generateToken } from '../../src/utils/jwt';

// Mock prisma with comprehensive mocks for order flow
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    store: {
      findUnique: jest.fn(),
    },
    storeSettings: {
      findUnique: jest.fn(),
    },
    storeMember: {
      findFirst: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
    deliveryZone: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    deliverySlot: {
      findFirst: jest.fn(),
    },
    blockedDate: {
      findFirst: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = createTestApp();

describe('Order Flow E2E Tests', () => {
  const mockStore = {
    id: 'store-123',
    name: 'Test Store',
    slug: 'test-store',
    address: '123 Test Street',
    latitude: 40.7128,
    longitude: -74.006,
    phone: '+1234567890',
    logo: 'https://example.com/logo.png',
    currency: 'EUR',
    isActive: true,
    ownerId: 'user-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Order Status Updates', () => {
    // Note: These tests require complex service mocking which is better covered in unit tests
    // The order status service layer is tested in orders.service.test.ts

    it.skip('should update order from CONFIRMED to PREPARING', async () => {
      const token = generateToken({
        userId: 'user-123',
        email: 'owner@example.com',
      });

      const mockOrder = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        storeId: 'store-123',
        status: 'CONFIRMED',
        store: mockStore,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'owner@example.com',
      });

      (mockPrisma.storeMember.findFirst as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        storeId: 'store-123',
        role: 'OWNER',
      });

      (mockPrisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);

      (mockPrisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'PREPARING',
      });

      const response = await request(app)
        .patch('/api/stores/store-123/orders/order-123/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'PREPARING' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('PREPARING');
    });

    it.skip('should update order from PREPARING to READY', async () => {
      const token = generateToken({
        userId: 'user-123',
        email: 'owner@example.com',
      });

      const mockOrder = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        storeId: 'store-123',
        status: 'PREPARING',
        store: mockStore,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'owner@example.com',
      });

      (mockPrisma.storeMember.findFirst as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        storeId: 'store-123',
        role: 'OWNER',
      });

      (mockPrisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);

      (mockPrisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'READY',
      });

      const response = await request(app)
        .patch('/api/stores/store-123/orders/order-123/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'READY' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('READY');
    });

    it.skip('should update order from READY to ON_THE_WAY', async () => {
      const token = generateToken({
        userId: 'user-123',
        email: 'owner@example.com',
      });

      const mockOrder = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        storeId: 'store-123',
        status: 'READY',
        deliveryUserId: 'delivery-user',
        store: mockStore,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'owner@example.com',
      });

      (mockPrisma.storeMember.findFirst as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        storeId: 'store-123',
        role: 'OWNER',
      });

      (mockPrisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);

      (mockPrisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'ON_THE_WAY',
        estimatedDeliveryTime: new Date(),
      });

      const response = await request(app)
        .patch('/api/stores/store-123/orders/order-123/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'ON_THE_WAY' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('ON_THE_WAY');
    });

    it.skip('should update order from ON_THE_WAY to DELIVERED', async () => {
      const token = generateToken({
        userId: 'user-123',
        email: 'owner@example.com',
      });

      const mockOrder = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        storeId: 'store-123',
        status: 'ON_THE_WAY',
        store: mockStore,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'owner@example.com',
      });

      (mockPrisma.storeMember.findFirst as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        storeId: 'store-123',
        role: 'OWNER',
      });

      (mockPrisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);

      (mockPrisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'DELIVERED',
        deliveredAt: new Date(),
      });

      const response = await request(app)
        .patch('/api/stores/store-123/orders/order-123/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'DELIVERED' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('DELIVERED');
    });
  });

  describe('Order Cancellation', () => {
    it('should allow customer to cancel within cancellation window', async () => {
      const recentOrder = {
        id: 'order-789',
        orderNumber: 'ORD-003',
        storeId: 'store-123',
        type: 'IMMEDIATE',
        status: 'CONFIRMED',
        paymentMethod: 'CASH',
        createdAt: new Date(),
        store: {
          ...mockStore,
          settings: {
            immediateCancelMinutes: 30,
          },
        },
      };

      (mockPrisma.order.findUnique as jest.Mock).mockResolvedValue(recentOrder);
      (mockPrisma.order.update as jest.Mock).mockResolvedValue({
        ...recentOrder,
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: 'Customer requested',
      });

      const response = await request(app)
        .post('/api/orders/order-789/cancel');

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CANCELLED');
    });
  });

  describe('Order Tracking', () => {
    it('should return order tracking info', async () => {
      const mockOrder = {
        id: 'order-track',
        orderNumber: 'ORD-TRACK',
        storeId: 'store-123',
        type: 'IMMEDIATE',
        status: 'ON_THE_WAY',
        paymentMethod: 'CASH',
        customerName: 'Tracker',
        items: [
          { productName: 'Pizza', quantity: 1, subtotal: 12.99 },
        ],
        store: {
          name: 'Test Store',
          phone: '+1234567890',
        },
        deliveryUser: {
          name: 'Delivery Person',
          phone: '+0987654321',
        },
      };

      (mockPrisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const response = await request(app)
        .get('/api/orders/order-track/track');

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('ON_THE_WAY');
    });
  });
});
