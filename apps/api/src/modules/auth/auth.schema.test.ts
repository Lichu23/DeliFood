import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema
} from './auth.schema';

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };

      const result = loginSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        body: {
          email: 'not-an-email',
          password: 'password123',
        },
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
          password: '',
        },
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const invalidData = {
        body: {
          password: 'password123',
        },
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
        },
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate valid password change data', () => {
      const validData = {
        body: {
          currentPassword: 'oldPassword123',
          newPassword: 'newPassword456',
        },
      };

      const result = changePasswordSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject empty current password', () => {
      const invalidData = {
        body: {
          currentPassword: '',
          newPassword: 'newPassword456',
        },
      };

      const result = changePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject short new password', () => {
      const invalidData = {
        body: {
          currentPassword: 'oldPassword123',
          newPassword: '12345',
        },
      };

      const result = changePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate valid profile update', () => {
      const validData = {
        body: {
          name: 'New Name',
          phone: '+1234567890',
        },
      };

      const result = updateProfileSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const validData = {
        body: {
          name: 'New Name',
        },
      };

      const result = updateProfileSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should allow empty body', () => {
      const validData = {
        body: {},
      };

      const result = updateProfileSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const invalidData = {
        body: {
          name: 'A',
        },
      };

      const result = updateProfileSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject short phone', () => {
      const invalidData = {
        body: {
          phone: '123',
        },
      };

      const result = updateProfileSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validRegisterData = {
      body: {
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
        currency: 'EUR',
        acceptsCash: true,
        acceptsTransfer: false,
        minAdvanceHours: 2,
        maxAdvanceDays: 7,
        immediateCancelMinutes: 30,
        scheduledCancelHours: 24,
        deliverySlots: [
          {
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '12:00',
            maxOrdersPerHour: 5,
          },
        ],
        deliveryZones: [
          {
            name: 'Zone 1',
            maxDistance: 10,
            deliveryFee: 5,
            minOrder: 15,
          },
        ],
      },
    };

    it('should validate complete registration data', () => {
      const result = registerSchema.safeParse(validRegisterData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          email: 'not-an-email',
        },
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          password: '12345',
        },
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should require at least one payment method', () => {
      const invalidData = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          acceptsCash: false,
          acceptsTransfer: false,
        },
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should require bank details when transfer is accepted', () => {
      const invalidData = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          acceptsCash: false,
          acceptsTransfer: true,
        },
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should accept transfer with bank details', () => {
      const validWithTransfer = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          acceptsCash: false,
          acceptsTransfer: true,
          bankName: 'Test Bank',
          bankAccountHolder: 'Test Holder',
          bankAccountNumber: '123456789',
        },
      };

      const result = registerSchema.safeParse(validWithTransfer);

      expect(result.success).toBe(true);
    });

    it('should require at least one delivery slot', () => {
      const invalidData = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          deliverySlots: [],
        },
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should require at least one delivery zone', () => {
      const invalidData = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          deliveryZones: [],
        },
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid time format in delivery slots', () => {
      const invalidData = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          deliverySlots: [
            {
              dayOfWeek: 1,
              startTime: '25:00', // Invalid hour
              endTime: '12:00',
              maxOrdersPerHour: 5,
            },
          ],
        },
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid latitude', () => {
      const invalidData = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          storeLatitude: 100, // Max is 90
        },
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const invalidData = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          storeLongitude: 200, // Max is 180
        },
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid currency', () => {
      const invalidData = {
        ...validRegisterData,
        body: {
          ...validRegisterData.body,
          currency: 'USD', // Only EUR and ARS are valid
        },
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});
