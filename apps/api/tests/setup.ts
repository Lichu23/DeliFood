// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
process.env.JWT_EXPIRES_IN = '7d';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.APP_URL = 'http://localhost:3000';
process.env.API_URL = 'http://localhost:4000';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global teardown
afterAll(async () => {
  // Cleanup any open handles
  await new Promise((resolve) => setTimeout(resolve, 100));
});
