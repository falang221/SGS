"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
const shared_1 = require("@school-mgmt/shared");
jest.mock('@school-mgmt/shared', () => ({
    __esModule: true,
    prisma: (0, jest_mock_extended_1.mockDeep)(),
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
    (0, jest_mock_extended_1.mockReset)(exports.prismaMock);
});
exports.prismaMock = shared_1.prisma;
