import { Request, Response } from 'express';
import { ParentController } from './parent.controller';
import { prismaMock } from '../../test/setup';

describe('ParentController', () => {
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

  it("retourne 401 si aucun parent n'est authentifié", async () => {
    req = {};

    await ParentController.getChildren(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Non autorisé' });
  });

  it("retourne 403 si le parent tente d'accéder aux paiements d'un autre élève", async () => {
    req = {
      params: { studentId: 'student-1' },
      // @ts-ignore
      user: { id: 'parent-1' },
    };
    // @ts-ignore
    prismaMock.student.findFirst.mockResolvedValue(null);

    await ParentController.getPayments(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Accès non autorisé à ce dossier' });
  });
});
