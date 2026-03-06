interface RuntimeEnv {
  port: number;
  databaseUrl: string;
}

function hasUnescapedAtInCredentials(databaseUrl: string): boolean {
  return /:\/\/[^:/?#]+:[^/?#]*@[^/?#]*@/.test(databaseUrl);
}

function parsePort(rawPort: string | undefined): number {
  if (!rawPort) return 3001;
  const parsed = Number(rawPort);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`PORT invalide: "${rawPort}". Utilisez un entier entre 1 et 65535.`);
  }
  return parsed;
}

export function validateRuntimeEnv(env: NodeJS.ProcessEnv = process.env): RuntimeEnv {
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL est requis.');
  }

  if (hasUnescapedAtInCredentials(databaseUrl)) {
    throw new Error(
      'DATABASE_URL invalide: caractère "@" non encodé dans les credentials (utilisez %40).',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL invalide: format URL non reconnu.');
  }

  if (!['postgresql:', 'postgres:'].includes(parsedUrl.protocol)) {
    throw new Error(
      `DATABASE_URL invalide: protocole "${parsedUrl.protocol}" non supporté (postgresql:// attendu).`,
    );
  }

  return {
    port: parsePort(env.PORT),
    databaseUrl,
  };
}
