import { HRController } from './hr.controller';
import { Request, Response } from 'express';
import { prismaMock } from '../../test/setup';
import bcrypt from 'bcryptjs';
import { HRService } from '../../services/hr.service';
import { UnauthorizedError } from '../../shared/utils/errors';

jest.mock('bcryptjs');

describe('HRController', () => {
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

  describe('createStaff', () => {
    it('doit créer un employé (User + Staff) en transaction', async () => {
      req = {
        body: {
          email: 'teacher@ecole.sn',
          firstName: 'Amadou',
          lastName: 'Sow',
          schoolId: validUUID,
          role: 'PROFESSEUR',
          salary: 300000,
          contractType: 'CDI'
        },
        // @ts-ignore
        user: { tenantId: 'tenant-1' }
      };

      const mockUser = { id: 'user-1', email: 'teacher@ecole.sn' };
      const mockStaff = { id: 'staff-1', userId: 'user-1', ...req.body };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      // @ts-ignore
      prismaMock.school.findFirst.mockResolvedValue({ id: validUUID });
      
      // @ts-ignore
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      // @ts-ignore
      prismaMock.user.create.mockResolvedValue(mockUser);
      // @ts-ignore
      prismaMock.staff.create.mockResolvedValue(mockStaff);

      await HRController.createStaff(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockStaff);
    });

    it('doit retourner 422 si le payload est invalide', async () => {
      req = {
        body: {
          email: 'teacher@ecole.sn',
          // firstName manquant
          lastName: 'Sow',
          schoolId: validUUID,
          role: 'PROFESSEUR',
        },
        // @ts-ignore
        user: { tenantId: 'tenant-1' },
      };

      await HRController.createStaff(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(422);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Données invalides',
        }),
      );
    });

    it('doit retourner 409 si email déjà existant', async () => {
      req = {
        body: {
          email: 'teacher@ecole.sn',
          firstName: 'Amadou',
          lastName: 'Sow',
          schoolId: validUUID,
          role: 'PROFESSEUR',
        },
        // @ts-ignore
        user: { tenantId: 'tenant-1' },
      };

      const createStaffSpy = jest
        .spyOn(HRService, 'createStaff')
        .mockRejectedValueOnce(new Error('Un utilisateur avec cet email existe déjà'));

      await HRController.createStaff(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Un utilisateur avec cet email existe déjà',
        }),
      );
      createStaffSpy.mockRestore();
    });
  });

  describe('generatePayroll', () => {
    it(`doit calculer la masse salariale d'une école`, async () => {
      req = {
        body: {
          schoolId: validUUID,
          month: 1,
          year: 2026
        },
        // @ts-ignore
        user: { tenantId: 'tenant-1' }
      };

      const mockStaffList = [
        { id: '1', salary: 100000 },
        { id: '2', salary: 200000 }
      ];

      // @ts-ignore
      prismaMock.staff.findMany.mockResolvedValue(mockStaffList);

      await HRController.generatePayroll(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        totalAmount: 300000,
        staffCount: 2
      }));
    });

    it("retourne 401 si l'utilisateur n'est pas authentifié", async () => {
      req = {
        body: {
          schoolId: validUUID,
          month: 1,
          year: 2026,
        },
      };

      await HRController.generatePayroll(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: new UnauthorizedError().message });
    });
  });
});
