import { AcademicController } from './academic.controller';
import { Request, Response } from 'express';
import { prismaMock } from '../../test/setup';

describe('AcademicController', () => {
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

  describe('createSubject', () => {
    it('doit créer une matière avec succès', async () => {
      req = {
        body: {
          name: 'Mathématiques',
          code: 'MATH01',
          coefficient: 4,
          schoolId: validUUID
        }
      };

      const mockSubject = { id: 'subj-1', ...req.body };
      // @ts-ignore
      prismaMock.subject.create.mockResolvedValue(mockSubject);

      await AcademicController.createSubject(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockSubject);
    });
  });

  describe('createTimetableEntry', () => {
    it(`doit créer un créneau d'emploi du temps s'il n'y a pas de conflit`, async () => {
      req = {
        body: {
          classId: validUUID,
          subjectId: validUUID,
          staffId: validUUID,
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '10:00',
          room: 'Salle 101'
        }
      };

      // @ts-ignore
      prismaMock.timetableEntry.findFirst.mockResolvedValue(null);
      // @ts-ignore
      prismaMock.timetableEntry.create.mockResolvedValue({ id: 'entry-1', ...req.body });

      await AcademicController.createTimetableEntry(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it(`doit retourner 409 en cas de conflit d'emploi du temps`, async () => {
      req = {
        body: {
          classId: validUUID,
          subjectId: validUUID,
          staffId: validUUID,
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '10:00',
          room: 'Salle 101'
        }
      };

      // @ts-ignore
      prismaMock.timetableEntry.findFirst.mockResolvedValue({ id: 'existing-entry' });

      await AcademicController.createTimetableEntry(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Conflit') }));
    });
  });
});
