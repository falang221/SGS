"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const logger_1 = require("../../shared/utils/logger");
const socket_service_1 = require("./socket.service");
class NotificationService {
    // Notification In-App (Socket.io)
    static async sendInApp(payload) {
        const io = (0, socket_service_1.getIO)();
        // Émettre soit au canal du tenant, soit à l'utilisateur spécifique
        const target = payload.userId ? `user-${payload.userId}` : payload.tenantId;
        io.to(target).emit('notification', {
            title: payload.title,
            message: payload.message,
            type: payload.type,
            timestamp: new Date()
        });
        logger_1.logger.info(`Notif In-App envoyée vers ${target}`);
    }
    // Simulation Afrikanet SMS (Section 6.2)
    static async sendSMS(phone, message) {
        logger_1.logger.info(`[Afrikanet SMS] Vers ${phone} : ${message}`);
        // Ici, intégration réelle avec l'API Afrikanet Sénégal
        // await axios.post('https://api.afrikanet.sn/sms/send', { phone, message, apikey: '...' });
    }
    // Simulation SendGrid Email
    static async sendEmail(to, subject, html) {
        logger_1.logger.info(`[SendGrid Email] Vers ${to} : ${subject}`);
        // Intégration SendGrid (MJML)
    }
    /**
     * Alerte Absence Parent (Métier)
     */
    static async notifyAbsence(tenantId, parentId, studentName) {
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
    static async notifyLowGrade(tenantId, parentId, studentName, subject, value) {
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
    static async notifyPaymentReminder(tenantId, parentId, studentName, amount) {
        await this.sendInApp({
            tenantId,
            userId: parentId,
            title: '💳 Rappel Paiement',
            message: `Rappel : Une mensualité de ${amount} FCFA pour ${studentName} est en attente.`,
            type: 'INFO'
        });
    }
}
exports.NotificationService = NotificationService;
