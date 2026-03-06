import { AttendanceController } from './attendance.controller';
import { Request, Response } from 'express';
import { prismaMock } from '../../test/setup';

describe('AttendanceController', () => {
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

  describe('submitBulk', () => {
    it(`doit enregistrer plusieurs présences d'un coup`, async () => {
      req = {
        body: [
          { enrollmentId: validUUID, status: 'PRESENT', date: new Date().toISOString() },
          { enrollmentId: validUUID, status: 'ABSENT', date: new Date().toISOString() }
        ],
        // @ts-ignore
        user: { id: 'teacher-1', tenantId: 'tenant-1' }
      };

      const mockRecord = { 
        id: '1', 
        status: 'PRESENT', 
        enrollment: { student: { firstName: 'A', parentId: null } } 
      };

      // @ts-ignore
      prismaMock.$transaction.mockResolvedValue([mockRecord, { ...mockRecord, status: 'ABSENT' }]);

      await AttendanceController.submitBulk(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: '2 présences enregistrées.' }));
    });
  });
});
