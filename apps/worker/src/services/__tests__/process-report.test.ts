import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prismaMock = mockDeep<PrismaClient>();
const prismaStorageRun = jest.fn((_context, callback: () => unknown) => callback());
const generateReportMock = jest.fn();
const uploadMock = jest.fn();
const calculateRankMock = jest.fn();

jest.mock('@school-mgmt/shared', () => ({
  __esModule: true,
  prisma: prismaMock,
  prismaStorage: {
    run: prismaStorageRun,
  },
}));

jest.mock('../../shared/utils/storage.service', () => ({
  StorageService: {
    upload: uploadMock,
  },
}));

jest.mock('../../services/pdf.service', () => ({
  PDFService: {
    generateReport: generateReportMock,
  },
}));

jest.mock('../../services/ranking.service', () => ({
  RankingService: {
    calculateRank: calculateRankMock,
    formatRank: (rank: number) => `${rank}eme`,
  },
}));

import { processReportJob } from '../../process-report';

describe('processReportJob', () => {
  beforeEach(() => {
    mockReset(prismaMock);
    prismaStorageRun.mockClear();
    generateReportMock.mockReset();
    uploadMock.mockReset();
    calculateRankMock.mockReset();
  });

  it('installe le contexte tenant et traite le bulletin', async () => {
    const birthDate = new Date('2010-01-02T00:00:00.000Z');
    prismaMock.student.findUnique.mockResolvedValue({
      schoolId: 'school-1',
      school: { name: 'Ecole Demo' },
      firstName: 'Awa',
      lastName: 'Diop',
      matricule: 'MAT-1',
      birthDate,
      enrollments: [
        {
          classId: 'class-1',
          class: { name: '6A' },
        },
      ],
    } as any);
    prismaMock.grade.findMany.mockResolvedValue([{ value: 15, coeff: 2 }] as any);
    calculateRankMock.mockResolvedValue({ rank: 2, total: 20, classAverage: 11.5 });
    generateReportMock.mockResolvedValue(Buffer.from('pdf'));
    uploadMock.mockResolvedValue(undefined);

    const result = await processReportJob({
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      studentId: 'student-1',
      period: 'Trimestre 1',
      year: '2024-2025',
    });

    expect(prismaStorageRun).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant-1' }),
      expect.any(Function),
    );
    expect(prismaMock.grade.findMany).toHaveBeenCalledWith({
      where: {
        enrollment: { studentId: 'student-1', yearId: '2024-2025' },
        period: 'Trimestre 1',
      },
    });
    expect(uploadMock).toHaveBeenCalledWith(
      'bulletins/2024-2025/Trimestre 1/student-1.pdf',
      expect.any(Buffer),
      'application/pdf',
    );
    expect(result).toEqual({
      status: 'SUCCESS',
      path: 'bulletins/2024-2025/Trimestre 1/student-1.pdf',
      rank: 2,
    });
  });

  it("rejette le job si l'école du job ne correspond pas à celle de l'élève", async () => {
    prismaMock.student.findUnique.mockResolvedValue({
      schoolId: 'other-school',
      enrollments: [{ classId: 'class-1', class: { name: '6A' } }],
    } as any);

    await expect(
      processReportJob({
        tenantId: 'tenant-1',
        schoolId: 'school-1',
        studentId: 'student-1',
        period: 'Trimestre 1',
        year: '2024-2025',
      }),
    ).rejects.toThrow("Élève ou inscription non trouvée");
  });
});
