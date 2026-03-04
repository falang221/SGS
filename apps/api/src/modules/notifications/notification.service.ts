import { logger } from '../../shared/utils/logger';
import { getIO } from './socket.service';

interface NotifPayload {
  tenantId: string;
  userId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

export class NotificationService {
  
  // Notification In-App (Socket.io)
  static async sendInApp(payload: NotifPayload) {
    const io = getIO();
    // Émettre soit au canal du tenant, soit à l'utilisateur spécifique
    const target = payload.userId ? `user-${payload.userId}` : payload.tenantId;
    io.to(target).emit('notification', {
      title: payload.title,
      message: payload.message,
      type: payload.type,
      timestamp: new Date()
    });
    logger.info(`Notif In-App envoyée vers ${target}`);
  }

  // Simulation Afrikanet SMS (Section 6.2)
  static async sendSMS(phone: string, message: string) {
    logger.info(`[Afrikanet SMS] Vers ${phone} : ${message}`);
    // Ici, intégration réelle avec l'API Afrikanet Sénégal
    // await axios.post('https://api.afrikanet.sn/sms/send', { phone, message, apikey: '...' });
  }

  // Simulation SendGrid Email
  static async sendEmail(to: string, subject: string, html: string) {
    logger.info(`[SendGrid Email] Vers ${to} : ${subject}`);
    // Intégration SendGrid (MJML)
  }

  /**
   * Alerte Absence Parent (Métier)
   */
  static async notifyAbsence(tenantId: string, parentId: string, studentName: string) {
     await this.sendInApp({
       tenantId,
       userId: parentId,
       title: '⚠️ Alerte Absence',
       message: `Votre enfant ${studentName} est marqué ABSENT ce jour.`,
       type: 'ERROR'
     });
     
     // Simulation SMS Sénégal
     await this.sendSMS('+221...', `SGS: Absence de ${studentName} signalée.`);
  }

  /**
   * Alerte Performance Académique (Métier)
   */
  static async notifyLowGrade(tenantId: string, parentId: string, studentName: string, subject: string, value: number) {
    await this.sendInApp({
      tenantId,
      userId: parentId,
      title: '📊 Alerte Performance',
      message: `Attention : ${studentName} a obtenu ${value}/20 en ${subject}. Un suivi est recommandé.`,
      type: 'WARNING'
    });
  }

  /**
   * Alerte Relance Paiement (Métier)
   */
  static async notifyPaymentReminder(tenantId: string, parentId: string, studentName: string, amount: number) {
    await this.sendInApp({
      tenantId,
      userId: parentId,
      title: '💳 Rappel Paiement',
      message: `Rappel : Une mensualité de ${amount} FCFA pour ${studentName} est en attente.`,
      type: 'INFO'
    });
  }
}
