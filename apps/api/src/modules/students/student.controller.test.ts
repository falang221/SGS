import { StudentController } from './student.controller';
import { Request, Response } from 'express';
import { prismaMock } from '../../test/setup';

describe('StudentController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    res = {
      json: jsonMock,
      status: statusMock,
    };
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('doit créer un élève avec succès', async () => {
      const birthDate = new Date('2010-01-01');
      req = {
        body: {
          firstName: 'Jean',
          lastName: 'Dupont',
          birthDate: birthDate.toISOString(),
          matricule: 'MAT001',
          schoolId: '550e8400-e29b-41d4-a716-446655440000'
        },
        // @ts-ignore
        user: { tenantId: 'tenant-1' }
      };

      const mockStudent = {
        id: 'student-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        birthDate,
        matricule: 'MAT001',
        schoolId: '550e8400-e29b-41d4-a716-446655440000'
      };

      // @ts-ignore
      prismaMock.school.findFirst.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440000' });
      // @ts-ignore
      prismaMock.student.create.mockResolvedValue(mockStudent);

      await StudentController.create(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockStudent);
    });

    it('doit retourner 400 si les données sont invalides', async () => {
      req = {
        body: {
          firstName: 'Jean'
          // Manque des champs requis
        },
        // @ts-ignore
        user: { tenantId: 'tenant-1' }
      };

      await StudentController.create(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('listBySchool', () => {
    it(`doit retourner la liste des élèves d'une école`, async () => {
      req = {
        params: { schoolId: 'school-1' },
        // @ts-ignore
        user: { tenantId: 'tenant-1' }
      };

      const mockStudents = [
        { id: '1', lastName: 'A', enrollments: [] },
        { id: '2', lastName: 'B', enrollments: [] }
      ];

      // @ts-ignore
      prismaMock.school.findFirst.mockResolvedValue({ id: 'school-1' });
      // @ts-ignore
      prismaMock.student.findMany.mockResolvedValue(mockStudents);

      await StudentController.listBySchool(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockStudents);
    });
  });

  describe('create auth', () => {
    it("retourne 401 si l'utilisateur n'est pas authentifié", async () => {
      req = {
        body: {
          firstName: 'Jean',
          lastName: 'Dupont',
          birthDate: new Date('2010-01-01').toISOString(),
          matricule: 'MAT001',
          schoolId: '550e8400-e29b-41d4-a716-446655440000',
        },
      };

      await StudentController.create(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Non autorisé' });
    });
  });
});
