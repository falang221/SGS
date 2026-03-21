import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { prisma } from '@school-mgmt/shared';
import { PrismaClient } from '@prisma/client';

jest.mock('@school-mgmt/shared', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
  prismaStorage: {
    run: (_context: unknown, callback: () => void) => callback(),
    getStore: () => ({}),
  },
}));

jest.mock('../shared/utils/cache.service', () => ({
  CacheService: {
    getOrSet: jest.fn((key, fn) => fn()),
    invalidate: jest.fn(),
    invalidatePattern: jest.fn(),
  }
}));

jest.mock('../shared/utils/audit.service', () => ({
  AuditService: {
    log: jest.fn().mockResolvedValue({ id: 'mock-audit-id' }),
  }
}));

jest.mock('../shared/utils/payment-provider.service', () => ({
  PaymentProviderService: {
    createWaveSession: jest.fn().mockResolvedValue({ id: 'wave-1', url: 'https://checkout.wave.sn/pay/1' }),
    createOMSession: jest.fn().mockResolvedValue({ id: 'om-1', url: 'https://om.sn/pay/1' }),
  }
}));

beforeEach(() => {
  mockReset(prismaMock);
});

afterAll(async () => {
  const { closeReportQueue } = await import('../shared/utils/queue.service');
  await closeReportQueue();
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
