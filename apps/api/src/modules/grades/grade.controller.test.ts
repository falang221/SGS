import { GradeController } from './grade.controller';
import { Request, Response } from 'express';
import { prismaMock } from '../../test/setup';
import { GradeService } from '../../services/grade.service';

describe('GradeController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    res = {
      json: jsonMock,
      status: statusMock,
    };
    jest.clearAllMocks();
  });

  describe('submit', () => {
    it('doit enregistrer une note avec succès', async () => {
      req = {
        body: {
          enrollmentId: validUUID,
          subjectId: validUUID,
          value: 15.5,
          coeff: 2,
          period: 'Semestre 1',
          type: 'DEVOIR'
        },
        // @ts-ignore
        user: { tenantId: 'tenant-1' }
      };

      const mockGrade = {
        id: 'grade-1',
        ...req.body,
        enrollment: {
          student: {
            firstName: 'Ahmed',
            parentId: null
          }
        }
      };

      // @ts-ignore
      prismaMock.grade.create.mockResolvedValue(mockGrade);

      await GradeController.submit(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockGrade);
    });
  });

  describe('generateReports', () => {
    it('retourne un statut degrade si la queue est indisponible', async () => {
      req = {
        body: {
          schoolId: validUUID,
          period: 'Trimestre 1',
          yearId: '2024-2025',
        },
        // @ts-ignore
        user: { tenantId: 'tenant-1' }
      };

      jest.spyOn(GradeService, 'launchReportGeneration').mockResolvedValue({
        requested: 3,
        queued: 1,
        skipped: 2,
      });

      await GradeController.generateReports(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        message:
          'La file de génération est indisponible pour le moment. Certains bulletins n’ont pas été mis en file.',
        status: 'DEGRADED',
        requested: 3,
        queued: 1,
        skipped: 2,
      });
    });
  });
});
