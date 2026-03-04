import { prisma, Payment } from '@school-mgmt/shared';
import { logger } from '../shared/utils/logger';
import { NotificationService } from '../modules/notifications/notification.service';
import { PaymentProviderService } from '../shared/utils/payment-provider.service';
import crypto from 'crypto';

export class FinanceService {
  static async sendReminders(schoolId: string, tenantId: string) {
    const lateEnrollments = await prisma.enrollment.findMany({
      where: { 
        student: { schoolId },
        status: 'ACTIVE',
        payments: { none: { status: 'COMPLETED' } }
      },
      include: { student: true }
    });

    for (const enrollment of lateEnrollments) {
      if (enrollment.student.parentId) {
        await NotificationService.notifyPaymentReminder(
          tenantId,
          enrollment.student.parentId,
          enrollment.student.firstName,
          Number(enrollment.feesTotal)
        );
      }
    }

    return lateEnrollments.length;
  }

  static async initiatePayment(data: any, userId: string, ipAddress: string) {
    const payment = await prisma.payment.create({
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
      const session = await PaymentProviderService.createWaveSession(data.amount, payment.id);
      checkoutUrl = session.url;
    } else if (data.method === 'ORANGE_MONEY') {
      const session = await PaymentProviderService.createOMSession(data.amount, payment.id);
      checkoutUrl = session.url;
    }

    logger.info(`Paiement ${payment.id} initié via ${data.method} pour ${data.amount} FCFA`);
    return { payment, checkoutUrl };
  }

  static async handleWebhook(body: any, signature: string | string[] | undefined) {
    const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'votre_secret_afrikanet_wave';

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const computedSignature = hmac.update(JSON.stringify(body)).digest('hex');

    if (signature !== computedSignature && process.env.NODE_ENV === 'production') {
       throw new Error('Signature Webhook Invalide');
    }

    const data = body; // Idéalement validé par DTO avant
    
    const updatedPayment = await prisma.payment.update({
      where: { id: data.metadata.paymentId },
      data: {
        status: data.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
        paidAt: data.status === 'SUCCESS' ? new Date() : null,
        providerRef: data.transactionId
      },
      include: { enrollment: { include: { student: true } } }
    });

    if (data.status === 'SUCCESS') {
       logger.info(`Paiement confirmé : ${updatedPayment.amount} FCFA pour ${updatedPayment.enrollment.student.firstName}`);
    }

    return updatedPayment;
  }

  static async getPaymentsByEnrollment(enrollmentId: string) {
    return prisma.payment.findMany({
      where: { enrollmentId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getFinanceStats(tenantId: string) {
    const [payments, totalExpected] = await Promise.all([
      prisma.payment.findMany({
        where: { 
          enrollment: { student: { school: { tenantId } } },
          status: 'COMPLETED'
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.enrollment.aggregate({
        where: { student: { school: { tenantId } } },
        _sum: { feesTotal: true }
      })
    ]);

    const collected = payments.reduce((acc: number, p: Payment) => acc + Number(p.amount), 0);
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
