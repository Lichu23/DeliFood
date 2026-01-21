// Test data factories for creating mock objects

export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  phone: '+1234567890',
  password: '$2b$10$hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockStore = (overrides = {}) => ({
  id: 'store-123',
  name: 'Test Store',
  slug: 'test-store',
  address: '123 Test Street',
  latitude: 40.7128,
  longitude: -74.006,
  phone: '+1234567890',
  logo: 'https://example.com/logo.png',
  currency: 'EUR' as const,
  acceptsCash: true,
  acceptsTransfer: false,
  bankName: null,
  bankAccountHolder: null,
  bankAccountNumber: null,
  bankAlias: null,
  minAdvanceHours: 2,
  maxAdvanceDays: 7,
  immediateCancelMinutes: 30,
  scheduledCancelHours: 24,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockMembership = (overrides = {}) => ({
  id: 'membership-123',
  userId: 'user-123',
  storeId: 'store-123',
  role: 'OWNER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCategory = (overrides = {}) => ({
  id: 'category-123',
  storeId: 'store-123',
  name: 'Test Category',
  description: 'Test category description',
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  id: 'product-123',
  storeId: 'store-123',
  categoryId: 'category-123',
  name: 'Test Product',
  description: 'Test product description',
  price: 10.99,
  image: 'https://example.com/product.png',
  isAvailable: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockDeliveryZone = (overrides = {}) => ({
  id: 'zone-123',
  storeId: 'store-123',
  name: 'Test Zone',
  maxDistance: 10,
  deliveryFee: 5,
  minOrder: 15,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockDeliverySlot = (overrides = {}) => ({
  id: 'slot-123',
  storeId: 'store-123',
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '12:00',
  maxOrdersPerHour: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: 'order-123',
  orderNumber: 'ORD-001',
  storeId: 'store-123',
  type: 'IMMEDIATE' as const,
  status: 'CONFIRMED' as const,
  paymentMethod: 'CASH' as const,
  paymentConfirmed: false,
  customerName: 'John Doe',
  customerPhone: '+1234567890',
  customerEmail: 'john@example.com',
  customerAddress: '456 Customer Street',
  customerLat: 40.7128,
  customerLng: -74.006,
  customerNotes: null,
  subtotal: 25.99,
  deliveryFee: 5,
  total: 30.99,
  scheduledDate: null,
  scheduledSlotStart: null,
  scheduledSlotEnd: null,
  deliveryZoneId: 'zone-123',
  deliveryUserId: null,
  estimatedDeliveryTime: null,
  deliveredAt: null,
  cancelledAt: null,
  cancellationReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockOrderItem = (overrides = {}) => ({
  id: 'item-123',
  orderId: 'order-123',
  productId: 'product-123',
  productName: 'Test Product',
  productPrice: 10.99,
  quantity: 2,
  subtotal: 21.98,
  notes: null,
  createdAt: new Date(),
  ...overrides,
});

export const createMockInvitation = (overrides = {}) => ({
  id: 'invitation-123',
  storeId: 'store-123',
  email: 'invitee@example.com',
  role: 'ADMIN' as const,
  token: 'invitation-token-123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  acceptedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockBlockedDate = (overrides = {}) => ({
  id: 'blocked-123',
  storeId: 'store-123',
  date: new Date('2026-12-25'),
  reason: 'Holiday',
  createdAt: new Date(),
  ...overrides,
});
