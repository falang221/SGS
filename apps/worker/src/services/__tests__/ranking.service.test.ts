import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prismaMock = mockDeep<PrismaClient>();

jest.mock('@school-mgmt/shared', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

import { RankingService } from '../ranking.service';

describe('RankingService', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('calculateRank', () => {
    it('doit calculer correctement le rang et la moyenne de classe', async () => {
      const classId = 'class-1';
      const yearId = '2024-2025';
      const period = 'Trimestre 1';

      const mockEnrollments = [
        {
          studentId: 'student-1',
          grades: [
            { value: 18, coeff: 2 }, // 36
            { value: 14, coeff: 1 }, // 14 -> Total 50 / 3 = 16.66
          ]
        },
        {
          studentId: 'student-2',
          grades: [
            { value: 10, coeff: 2 }, // 20
            { value: 8, coeff: 1 },  // 8 -> Total 28 / 3 = 9.33
          ]
        },
        {
          studentId: 'student-3',
          grades: [
            { value: 20, coeff: 1 }, // 20 -> Total 20 / 1 = 20
          ]
        }
      ];

      // @ts-ignore
      prismaMock.enrollment.findMany.mockResolvedValue(mockEnrollments);

      const result = await RankingService.calculateRank(classId, yearId, period, 'student-1');

      // Rangs attendus : student-3 (20.00), student-1 (16.66), student-2 (9.33)
      expect(result.rank).toBe(2);
      expect(result.total).toBe(3);
      expect(result.classAverage).toBe(15.33); // (20 + 16.666 + 9.333) / 3 = 46 / 3 = 15.33
    });

    it(`doit retourner 0 si aucun élève n'est trouvé`, async () => {
      // @ts-ignore
      prismaMock.enrollment.findMany.mockResolvedValue([]);
      const result = await RankingService.calculateRank('c1', 'y1', 'p1', 's1');
      expect(result.rank).toBe(0);
    });
  });

  describe('formatRank', () => {
    it('doit formater 1 en 1er', () => {
      expect(RankingService.formatRank(1)).toBe('1er');
    });
    it('doit formater 2 en 2ème', () => {
      expect(RankingService.formatRank(2)).toBe('2ème');
    });
  });
});
