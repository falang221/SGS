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

const SENSITIVE_FIELDS = ['password', 'token', 'refreshToken', 'accessToken'];

export class AuditService {
  /**
   * Filtre les données sensibles avant enregistrement
   */
  private static filterSensitive(data: any): any {
    if (!data) return data;
    const filtered = { ...data };
    for (const field of SENSITIVE_FIELDS) {
      if (field in filtered) {
        filtered[field] = '[MASKED]';
      }
    }
    return filtered;
  }

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
          oldValue: payload.oldValue ? this.filterSensitive(payload.oldValue) : null,
          newValue: payload.newValue ? this.filterSensitive(payload.newValue) : null,
          ipAddress: payload.ipAddress,
        },
      });
      
      logger.info(`[Audit] Action "${payload.action}" sur "${payload.resource}" enregistrée (ID: ${logEntry.id})`);
      return logEntry;
    } catch (error) {
      logger.error(`[Audit] Échec de l'enregistrement du log d'audit:`, error);
    }
  }
}
