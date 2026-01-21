import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const prismaMock = mockDeep<PrismaClient>();

// Mock the prisma module
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

export function resetPrismaMock() {
  Object.keys(prismaMock).forEach((key) => {
    const mock = (prismaMock as any)[key];
    if (mock && typeof mock.mockReset === 'function') {
      mock.mockReset();
    }
  });
}
