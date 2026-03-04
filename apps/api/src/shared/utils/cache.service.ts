import Redis from 'ioredis';
import { logger } from './logger';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

redis.on('connect', () => logger.info('✅ Connecté à Redis pour le cache'));
redis.on('error', (err) => logger.error('❌ Erreur Redis:', err));

export class CacheService {
  /**
   * Récupère une valeur du cache ou exécute la fonction de secours
   */
  static async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
    const cached = await redis.get(key);
    
    if (cached) {
      logger.info(`[Cache] HIT: ${key}`);
      return JSON.parse(cached);
    }

    logger.info(`[Cache] MISS: ${key}`);
    const result = await fetchFn();
    
    await redis.set(key, JSON.stringify(result), 'EX', ttlSeconds);
    return result;
  }

  /**
   * Invalide une ou plusieurs clés (ex: après une modification)
   */
  static async invalidate(keys: string | string[]) {
    if (Array.isArray(keys)) {
      await redis.del(...keys);
    } else {
      await redis.del(keys);
    }
    logger.info(`[Cache] INVALIDATED: ${keys}`);
  }

  /**
   * Invalide les clés par pattern (ex: subjects:*)
   */
  static async invalidatePattern(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`[Cache] INVALIDATED PATTERN: ${pattern} (${keys.length} keys)`);
    }
  }
}

export default redis;
