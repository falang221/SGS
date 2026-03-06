import { validateRuntimeEnv } from './runtime-env';

describe('validateRuntimeEnv', () => {
  it('retourne la config runtime valide', () => {
    const runtime = validateRuntimeEnv({
      DATABASE_URL: 'postgresql://postgres:password@localhost:5432/school_mgmt?schema=public',
      PORT: '3001',
    } as NodeJS.ProcessEnv);

    expect(runtime).toEqual({
      databaseUrl: 'postgresql://postgres:password@localhost:5432/school_mgmt?schema=public',
      port: 3001,
    });
  });

  it('utilise le port par défaut si PORT est absent', () => {
    const runtime = validateRuntimeEnv({
      DATABASE_URL: 'postgresql://postgres:password@localhost:5432/school_mgmt?schema=public',
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
      } as NodeJS.ProcessEnv),
    ).toThrow('DATABASE_URL invalide: caractère "@" non encodé dans les credentials');
  });

  it('rejette DATABASE_URL avec protocole non supporté', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_URL: 'mysql://user:password@localhost:3306/db',
      } as NodeJS.ProcessEnv),
    ).toThrow('DATABASE_URL invalide: protocole');
  });

  it('rejette PORT invalide', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/school_mgmt?schema=public',
        PORT: '70000',
      } as NodeJS.ProcessEnv),
    ).toThrow('PORT invalide');
  });
});
