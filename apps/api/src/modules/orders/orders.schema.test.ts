import {
  createOrderSchema,
  updateOrderStatusSchema,
  assignDeliverySchema,
  cancelOrderSchema,
  confirmPaymentSchema,
  customerCancelOrderSchema,
} from './orders.schema';

describe('Orders Schemas', () => {
  describe('createOrderSchema', () => {
    const validOrderData = {
      body: {
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        customerAddress: '123 Main Street',
        customerLat: 40.7128,
        customerLng: -74.006,
        type: 'IMMEDIATE',
        paymentMethod: 'CASH',
        items: [
          {
            productId: 'product-123',
            quantity: 2,
          },
        ],
      },
      params: {
        slug: 'test-store',
      },
    };

    it('should validate valid immediate order', () => {
      const result = createOrderSchema.safeParse(validOrderData);

      expect(result.success).toBe(true);
    });

    it('should validate order with optional fields', () => {
      const dataWithOptional = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          customerEmail: 'john@example.com',
          customerNotes: 'Please ring the bell',
          items: [
            {
              productId: 'product-123',
              quantity: 2,
              notes: 'No onions',
            },
          ],
        },
      };

      const result = createOrderSchema.safeParse(dataWithOptional);

      expect(result.success).toBe(true);
    });

    it('should validate scheduled order with required fields', () => {
      const scheduledOrder = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          type: 'SCHEDULED',
          scheduledDate: '2026-12-25',
          scheduledSlotStart: '10:00',
          scheduledSlotEnd: '12:00',
        },
      };

      const result = createOrderSchema.safeParse(scheduledOrder);

      expect(result.success).toBe(true);
    });

    it('should reject scheduled order without date', () => {
      const invalidScheduled = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          type: 'SCHEDULED',
          // Missing scheduledDate, scheduledSlotStart, scheduledSlotEnd
        },
      };

      const result = createOrderSchema.safeParse(invalidScheduled);

      expect(result.success).toBe(false);
    });

    it('should reject short customer name', () => {
      const invalidData = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          customerName: 'J',
        },
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid customer email', () => {
      const invalidData = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          customerEmail: 'not-an-email',
        },
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject empty items array', () => {
      const invalidData = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          items: [],
        },
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject item with zero quantity', () => {
      const invalidData = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          items: [
            {
              productId: 'product-123',
              quantity: 0,
            },
          ],
        },
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid latitude', () => {
      const invalidData = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          customerLat: 100, // Max is 90
        },
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid payment method', () => {
      const invalidData = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          paymentMethod: 'CREDIT_CARD', // Not supported
        },
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid order type', () => {
      const invalidData = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          type: 'EXPRESS', // Not supported
        },
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          type: 'SCHEDULED',
          scheduledDate: '25-12-2026', // Should be YYYY-MM-DD
          scheduledSlotStart: '10:00',
          scheduledSlotEnd: '12:00',
        },
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const invalidData = {
        ...validOrderData,
        body: {
          ...validOrderData.body,
          type: 'SCHEDULED',
          scheduledDate: '2026-12-25',
          scheduledSlotStart: '25:00', // Invalid hour
          scheduledSlotEnd: '12:00',
        },
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing store slug', () => {
      const invalidData = {
        ...validOrderData,
        params: {
          slug: '',
        },
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('updateOrderStatusSchema', () => {
    it('should validate valid status update', () => {
      const validData = {
        body: {
          status: 'PREPARING',
        },
        params: {
          storeId: 'store-123',
          orderId: 'order-123',
        },
      };

      const result = updateOrderStatusSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept all valid statuses', () => {
      const validStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'ON_THE_WAY', 'DELIVERED'];

      validStatuses.forEach((status) => {
        const data = {
          body: { status },
          params: { storeId: 'store-123', orderId: 'order-123' },
        };

        const result = updateOrderStatusSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const invalidData = {
        body: {
          status: 'PENDING', // Not allowed in update
        },
        params: {
          storeId: 'store-123',
          orderId: 'order-123',
        },
      };

      const result = updateOrderStatusSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing store ID', () => {
      const invalidData = {
        body: {
          status: 'PREPARING',
        },
        params: {
          storeId: '',
          orderId: 'order-123',
        },
      };

      const result = updateOrderStatusSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('assignDeliverySchema', () => {
    it('should validate valid assignment', () => {
      const validData = {
        body: {
          deliveryUserId: 'user-456',
        },
        params: {
          storeId: 'store-123',
          orderId: 'order-123',
        },
      };

      const result = assignDeliverySchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject empty delivery user ID', () => {
      const invalidData = {
        body: {
          deliveryUserId: '',
        },
        params: {
          storeId: 'store-123',
          orderId: 'order-123',
        },
      };

      const result = assignDeliverySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('cancelOrderSchema', () => {
    it('should validate valid cancellation', () => {
      const validData = {
        body: {
          reason: 'Customer requested cancellation',
        },
        params: {
          storeId: 'store-123',
          orderId: 'order-123',
        },
      };

      const result = cancelOrderSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject empty reason', () => {
      const invalidData = {
        body: {
          reason: '',
        },
        params: {
          storeId: 'store-123',
          orderId: 'order-123',
        },
      };

      const result = cancelOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('confirmPaymentSchema', () => {
    it('should validate valid confirmation', () => {
      const validData = {
        params: {
          storeId: 'store-123',
          orderId: 'order-123',
        },
      };

      const result = confirmPaymentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject missing order ID', () => {
      const invalidData = {
        params: {
          storeId: 'store-123',
          orderId: '',
        },
      };

      const result = confirmPaymentSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('customerCancelOrderSchema', () => {
    it('should validate valid customer cancellation', () => {
      const validData = {
        params: {
          orderId: 'order-123',
        },
      };

      const result = customerCancelOrderSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject empty order ID', () => {
      const invalidData = {
        params: {
          orderId: '',
        },
      };

      const result = customerCancelOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});
