import { prisma } from '@school-mgmt/shared';
import { logger } from './logger';

export interface AuditLogPayload {
  userId?: string;
  action: string;
  resource: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}

export class AuditService {
  /**
   * Enregistre une action dans les logs d'audit
   */
  static async log(payload: AuditLogPayload) {
    try {
      const logEntry = await prisma.auditLog.create({
        data: {
          userId: payload.userId,
          action: payload.action,
          resource: payload.resource,
          oldValue: payload.oldValue ? JSON.parse(JSON.stringify(payload.oldValue)) : null,
          newValue: payload.newValue ? JSON.parse(JSON.stringify(payload.newValue)) : null,
          ipAddress: payload.ipAddress,
        },
      });
      
      logger.info(`[Audit] Action "${payload.action}" sur "${payload.resource}" enregistrée (ID: ${logEntry.id})`);
      return logEntry;
    } catch (error) {
      // On ne bloque pas l'exécution de l'application si le log d'audit échoue,
      // mais on logue l'erreur de manière critique.
      logger.error(`[Audit] Échec de l'enregistrement du log d'audit:`, error);
    }
  }
}
