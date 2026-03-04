"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const shared_1 = require("@school-mgmt/shared");
const logger_1 = require("./logger");
class AuditService {
    /**
     * Enregistre une action dans les logs d'audit
     */
    static async log(payload) {
        try {
            const logEntry = await shared_1.prisma.auditLog.create({
                data: {
                    userId: payload.userId,
                    action: payload.action,
                    resource: payload.resource,
                    oldValue: payload.oldValue ? JSON.parse(JSON.stringify(payload.oldValue)) : null,
                    newValue: payload.newValue ? JSON.parse(JSON.stringify(payload.newValue)) : null,
                    ipAddress: payload.ipAddress,
                },
            });
            logger_1.logger.info(`[Audit] Action "${payload.action}" sur "${payload.resource}" enregistrée (ID: ${logEntry.id})`);
            return logEntry;
        }
        catch (error) {
            // On ne bloque pas l'exécution de l'application si le log d'audit échoue,
            // mais on logue l'erreur de manière critique.
            logger_1.logger.error(`[Audit] Échec de l'enregistrement du log d'audit:`, error);
        }
    }
}
exports.AuditService = AuditService;
