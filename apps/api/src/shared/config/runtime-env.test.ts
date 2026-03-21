import { validateRuntimeEnv } from './runtime-env';

describe('validateRuntimeEnv', () => {
  it('retourne la config runtime valide', () => {
    const runtime = validateRuntimeEnv({
      DATABASE_URL: 'postgresql://postgres:password@localhost:5432/school_mgmt?schema=public',
      PORT: '3001',
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
    } as NodeJS.ProcessEnv);

    expect(runtime).toEqual({
      databaseUrl: 'postgresql://postgres:password@localhost:5432/school_mgmt?schema=public',
      port: 3001,
    });
  });

  it('utilise le port par défaut si PORT est absent', () => {
    const runtime = validateRuntimeEnv({
      DATABASE_URL: 'postgresql://postgres:password@localhost:5432/school_mgmt?schema=public',
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
    } as NodeJS.ProcessEnv);

    expect(runtime.port).toBe(3001);
  });

  it('rejette DATABASE_URL absente', () => {
    expect(() => validateRuntimeEnv({} as NodeJS.ProcessEnv)).toThrow('DATABASE_URL est requis.');
  });

  it('rejette DATABASE_URL avec @ non encodé', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_URL: 'postgresql://postgres:R@hmane2012@localhost:5432/school_mgmt?schema=public',
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
      } as NodeJS.ProcessEnv),
    ).toThrow('DATABASE_URL invalide: caractère "@" non encodé dans les credentials');
  });

  it('rejette DATABASE_URL avec protocole non supporté', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_URL: 'mysql://user:password@localhost:3306/db',
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
      } as NodeJS.ProcessEnv),
    ).toThrow('DATABASE_URL invalide: protocole');
  });

  it('rejette PORT invalide', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/school_mgmt?schema=public',
        PORT: '70000',
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
      } as NodeJS.ProcessEnv),
    ).toThrow('PORT invalide');
  });

  it('rejette JWT_ACCESS_SECRET absente', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/school_mgmt?schema=public',
        JWT_REFRESH_SECRET: 'refresh-secret',
      } as NodeJS.ProcessEnv),
    ).toThrow('JWT_ACCESS_SECRET est requis.');
  });

  it('rejette JWT_REFRESH_SECRET absente', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/school_mgmt?schema=public',
        JWT_ACCESS_SECRET: 'access-secret',
      } as NodeJS.ProcessEnv),
    ).toThrow('JWT_REFRESH_SECRET est requis.');
  });
});
