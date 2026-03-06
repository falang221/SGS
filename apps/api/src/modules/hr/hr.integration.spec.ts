import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../app';
import { HRService } from '../../services/hr.service';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-default';

function makeAccessToken(tenantId: string) {
  return jwt.sign(
    {
      sub: 'user-integration-1',
      tenantId,
      role: 'SUPER_ADMIN',
      permissions: [],
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' },
  );
}

describe('HR API integration', () => {
  const tenantId = 'tenant-int-1';
  const schoolId = '550e8400-e29b-41d4-a716-446655440000';
  const token = makeAccessToken(tenantId);
  const app = createApp();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retourne 422 si le payload est invalide', async () => {
    const response = await request(app)
      .post('/api/v1/hr/create')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', tenantId)
      .send({
        email: 'teacher@ecole.sn',
        // firstName manquant
        lastName: 'Sow',
        role: 'PROFESSEUR',
        schoolId,
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Données invalides',
      }),
    );
  });

  it('retourne 409 si email déjà existant', async () => {
    jest
      .spyOn(HRService, 'createStaff')
      .mockRejectedValueOnce(new Error('Un utilisateur avec cet email existe déjà'));

    const response = await request(app)
      .post('/api/v1/hr/create')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', tenantId)
      .send({
        email: 'teacher@ecole.sn',
        firstName: 'Amadou',
        lastName: 'Sow',
        role: 'PROFESSEUR',
        schoolId,
        systemRole: 'ENSEIGNANT',
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Un utilisateur avec cet email existe déjà',
      }),
    );
  });
});
