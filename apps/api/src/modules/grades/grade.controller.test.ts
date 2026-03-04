import { GradeController } from './grade.controller';
import { Request, Response } from 'express';
import { prismaMock } from '../../test/setup';

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
});
