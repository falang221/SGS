"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const shared_1 = require("@school-mgmt/shared");
const logger_1 = require("../shared/utils/logger");
const notification_service_1 = require("../modules/notifications/notification.service");
const payment_provider_service_1 = require("../shared/utils/payment-provider.service");
const crypto_1 = __importDefault(require("crypto"));
class FinanceService {
    static async sendReminders(schoolId, tenantId) {
        const lateEnrollments = await shared_1.prisma.enrollment.findMany({
            where: {
                student: { schoolId },
                status: 'ACTIVE',
                payments: { none: { status: 'COMPLETED' } }
            },
            include: { student: true }
        });
        for (const enrollment of lateEnrollments) {
            if (enrollment.student.parentId) {
                await notification_service_1.NotificationService.notifyPaymentReminder(tenantId, enrollment.student.parentId, enrollment.student.firstName, Number(enrollment.feesTotal));
            }
        }
        return lateEnrollments.length;
    }
    static async initiatePayment(data, userId, ipAddress) {
        const payment = await shared_1.prisma.payment.create({
            data: {
                enrollmentId: data.enrollmentId,
                amount: data.amount,
                method: data.method,
                status: data.method === 'CASH' ? 'COMPLETED' : 'PENDING',
                paidAt: data.method === 'CASH' ? new Date() : null
            }
        });
        let checkoutUrl = null;
        if (data.method === 'WAVE') {
            const session = await payment_provider_service_1.PaymentProviderService.createWaveSession(data.amount, payment.id);
            checkoutUrl = session.url;
        }
        else if (data.method === 'ORANGE_MONEY') {
            const session = await payment_provider_service_1.PaymentProviderService.createOMSession(data.amount, payment.id);
            checkoutUrl = session.url;
        }
        logger_1.logger.info(`Paiement ${payment.id} initié via ${data.method} pour ${data.amount} FCFA`);
        return { payment, checkoutUrl };
    }
    static async handleWebhook(body, signature) {
        const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'votre_secret_afrikanet_wave';
        const hmac = crypto_1.default.createHmac('sha256', WEBHOOK_SECRET);
        const computedSignature = hmac.update(JSON.stringify(body)).digest('hex');
        if (signature !== computedSignature && process.env.NODE_ENV === 'production') {
            throw new Error('Signature Webhook Invalide');
        }
        const data = body; // Idéalement validé par DTO avant
        const updatedPayment = await shared_1.prisma.payment.update({
            where: { id: data.metadata.paymentId },
            data: {
                status: data.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
                paidAt: data.status === 'SUCCESS' ? new Date() : null,
                providerRef: data.transactionId
            },
            include: { enrollment: { include: { student: true } } }
        });
        if (data.status === 'SUCCESS') {
            logger_1.logger.info(`Paiement confirmé : ${updatedPayment.amount} FCFA pour ${updatedPayment.enrollment.student.firstName}`);
        }
        return updatedPayment;
    }
    static async getPaymentsByEnrollment(enrollmentId) {
        return shared_1.prisma.payment.findMany({
            where: { enrollmentId },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async getFinanceStats(tenantId) {
        const [payments, totalExpected] = await Promise.all([
            shared_1.prisma.payment.findMany({
                where: {
                    enrollment: { student: { school: { tenantId } } },
                    status: 'COMPLETED'
                },
                orderBy: { createdAt: 'desc' },
                take: 50
            }),
            shared_1.prisma.enrollment.aggregate({
                where: { student: { school: { tenantId } } },
                _sum: { feesTotal: true }
            })
        ]);
        const collected = payments.reduce((acc, p) => acc + Number(p.amount), 0);
        const expected = Number(totalExpected._sum.feesTotal || 0);
        const pending = expected - collected;
        const recoveryRate = expected > 0 ? (collected / expected) * 100 : 0;
        return {
            collected,
            pending: pending > 0 ? pending : 0,
            recoveryRate: Math.round(recoveryRate),
            recentTransactions: payments
        };
    }
}
exports.FinanceService = FinanceService;
