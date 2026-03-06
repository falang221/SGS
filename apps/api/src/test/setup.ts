import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { prisma } from '@school-mgmt/shared';
import { PrismaClient } from '@prisma/client';
import { closeReportQueue } from '../shared/utils/queue.service';

jest.mock('@school-mgmt/shared', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
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
  await closeReportQueue();
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
