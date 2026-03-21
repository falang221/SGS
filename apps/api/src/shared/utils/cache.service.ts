import Redis from 'ioredis';
import { logger } from './logger';

const REDIS_RETRY_COOLDOWN_MS = 10_000;

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  connectTimeout: 1000,
  enableOfflineQueue: false,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
});

let redisUnavailableUntil = 0;
let hasLoggedRedisUnavailable = false;

function isRedisCoolingDown(now = Date.now()) {
  return now < redisUnavailableUntil;
}

function markRedisUnavailable(error?: unknown) {
  const now = Date.now();

  if (!isRedisCoolingDown(now)) {
    redisUnavailableUntil = now + REDIS_RETRY_COOLDOWN_MS;
    hasLoggedRedisUnavailable = false;
  }

  if (!hasLoggedRedisUnavailable) {
    logger.warn(
      {
        error,
        retryInMs: REDIS_RETRY_COOLDOWN_MS,
      },
      '[Cache] Redis indisponible, passage temporaire en mode sans cache',
    );
    hasLoggedRedisUnavailable = true;
  }
}

redis.on('connect', () => {
  redisUnavailableUntil = 0;
  hasLoggedRedisUnavailable = false;
  logger.info('✅ Connecté à Redis pour le cache');
});
redis.on('error', (err) => {
  markRedisUnavailable(err);
});

async function ensureCacheConnection() {
  if (isRedisCoolingDown()) return false;
  if (redis.status === 'ready') return true;
  if (redis.status === 'connecting') return false;

  try {
    await redis.connect();
    return true;
  } catch (error) {
    markRedisUnavailable(error);
    return false;
  }
}

async function safeGet(key: string) {
  const isReady = await ensureCacheConnection();
  if (!isReady) return null;

  try {
    return await redis.get(key);
  } catch (error) {
    logger.warn({ error, key }, '[Cache] Lecture ignorée, Redis indisponible');
    return null;
  }
}

async function safeSet(key: string, value: string, ttlSeconds: number) {
  const isReady = await ensureCacheConnection();
  if (!isReady) return;

  try {
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch (error) {
    logger.warn({ error, key }, '[Cache] Écriture ignorée, Redis indisponible');
  }
}

async function safeDel(...keys: string[]) {
  const isReady = await ensureCacheConnection();
  if (!isReady || keys.length === 0) return;

  try {
    await redis.del(...keys);
  } catch (error) {
    logger.warn({ error, keys }, '[Cache] Invalidation ignorée, Redis indisponible');
  }
}

export class CacheService {
  /**
   * Récupère une valeur du cache ou exécute la fonction de secours
   */
  static async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
    const cached = await safeGet(key);
    
    if (cached) {
      logger.info(`[Cache] HIT: ${key}`);
      return JSON.parse(cached);
    }

    logger.info(`[Cache] MISS: ${key}`);
    const result = await fetchFn();
    
    await safeSet(key, JSON.stringify(result), ttlSeconds);
    return result;
  }

  /**
   * Invalide une ou plusieurs clés (ex: après une modification)
   */
  static async invalidate(keys: string | string[]) {
    if (Array.isArray(keys)) {
      await safeDel(...keys);
    } else {
      await safeDel(keys);
    }
    logger.info(`[Cache] INVALIDATED: ${keys}`);
  }

  /**
   * Invalide les clés par pattern (ex: subjects:*)
   */
  static async invalidatePattern(pattern: string) {
    const isReady = await ensureCacheConnection();
    if (!isReady) return;

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await safeDel(...keys);
        logger.info(`[Cache] INVALIDATED PATTERN: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      logger.warn({ error, pattern }, '[Cache] Invalidation pattern ignorée, Redis indisponible');
    }
  }
}

export default redis;
