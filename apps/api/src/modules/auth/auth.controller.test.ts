import { AuthController } from './auth.controller';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prismaMock } from '../../test/setup';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    req = {
      body: {
        email: 'admin@ecole.sn',
        password: 'admin12345'
      }
    };
    res = {
      json: jsonMock,
      status: statusMock,
      cookie: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('doit se connecter avec succès et retourner un token', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'admin@ecole.sn',
        password: 'hashed-password',
        role: 'DIRECTEUR',
        tenantId: 'tenant-1',
        permissions: []
      };

      // @ts-ignore
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      await AuthController.login(req as Request, res as Response);

      expect(statusMock).not.toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        accessToken: 'mock-token',
        user: expect.objectContaining({
          email: 'admin@ecole.sn'
        })
      }));
    });

    it('doit retourner 401 si les identifiants sont incorrects', async () => {
      // @ts-ignore
      prismaMock.user.findUnique.mockResolvedValue(null);

      await AuthController.login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Identifiants invalides' });
    });

    it('doit retourner 401 si le mot de passe ne correspond pas', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'admin@ecole.sn',
        password: 'hashed-password'
      };

      // @ts-ignore
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await AuthController.login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Identifiants invalides' });
    });
  });
});
