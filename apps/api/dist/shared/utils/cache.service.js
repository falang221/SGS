"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
});
redis.on('connect', () => logger_1.logger.info('✅ Connecté à Redis pour le cache'));
redis.on('error', (err) => logger_1.logger.error('❌ Erreur Redis:', err));
class CacheService {
    /**
     * Récupère une valeur du cache ou exécute la fonction de secours
     */
    static async getOrSet(key, fetchFn, ttlSeconds = 3600) {
        const cached = await redis.get(key);
        if (cached) {
            logger_1.logger.info(`[Cache] HIT: ${key}`);
            return JSON.parse(cached);
        }
        logger_1.logger.info(`[Cache] MISS: ${key}`);
        const result = await fetchFn();
        await redis.set(key, JSON.stringify(result), 'EX', ttlSeconds);
        return result;
    }
    /**
     * Invalide une ou plusieurs clés (ex: après une modification)
     */
    static async invalidate(keys) {
        if (Array.isArray(keys)) {
            await redis.del(...keys);
        }
        else {
            await redis.del(keys);
        }
        logger_1.logger.info(`[Cache] INVALIDATED: ${keys}`);
    }
    /**
     * Invalide les clés par pattern (ex: subjects:*)
     */
    static async invalidatePattern(pattern) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            logger_1.logger.info(`[Cache] INVALIDATED PATTERN: ${pattern} (${keys.length} keys)`);
        }
    }
}
exports.CacheService = CacheService;
exports.default = redis;
