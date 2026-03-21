import { prisma, Payment } from '@school-mgmt/shared';
import { logger } from '../shared/utils/logger';
import { NotificationService } from '../modules/notifications/notification.service';
import { PaymentProviderService } from '../shared/utils/payment-provider.service';
import crypto from 'crypto';
import { AppError, UnauthorizedError } from '../shared/utils/errors';

export class FinanceService {
  private static getWebhookSecret(): string {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (!secret) {
      throw new AppError('PAYMENT_WEBHOOK_SECRET est requis pour valider les webhooks', 503);
    }

    return secret;
  }

  private static normalizeSignature(signature: string | string[] | undefined): string {
    if (!signature) {
      throw new UnauthorizedError('Signature webhook manquante');
    }

    const rawSignature = Array.isArray(signature) ? signature[0] : signature;
    return rawSignature.startsWith('sha256=') ? rawSignature.slice('sha256='.length) : rawSignature;
  }

  private static assertValidWebhookSignature(
    signature: string | string[] | undefined,
    rawBody: string,
  ): void {
    const providedSignature = this.normalizeSignature(signature);
    const expectedSignature = crypto
      .createHmac('sha256', this.getWebhookSecret())
      .update(rawBody)
      .digest('hex');

    const providedBuffer = Buffer.from(providedSignature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedError('Signature webhook invalide');
    }
  }

  /**
   * Envoi de rappels de paiement automatiques pour les impayés
   */
  static async sendReminders(schoolId: string, tenantId: string) {
    // Récupérer les inscriptions avec un solde restant > 0
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        student: { schoolId },
        status: 'ACTIVE'
      },
      include: { 
        student: true,
        payments: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    const lateEnrollments = enrollments.filter((e: any) => {
      const paid = e.payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
      return Number(e.feesTotal) - paid > 0;
    });

    for (const enrollment of lateEnrollments) {
      if (enrollment.student.parentId) {
        const paid = enrollment.payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
        const remaining = Number(enrollment.feesTotal) - paid;

        await NotificationService.notifyPaymentReminder(
          tenantId,
          enrollment.student.parentId,
          enrollment.student.firstName,
          remaining
        );
      }
    }

    return lateEnrollments.length;
  }

  /**
   * Initialisation d'un paiement (Passerelle ou Cash)
   */
  static async initiatePayment(data: any, userId: string, ipAddress: string) {
    const payment = await prisma.payment.create({
      data: {
        enrollmentId: data.enrollmentId,
        amount: data.amount,
        method: data.method,
        status: data.method === 'CASH' ? 'COMPLETED' : 'PENDING',
        paidAt: data.method === 'CASH' ? new Date() : null,
        providerRef: data.method === 'CASH' ? `CASH-${Date.now()}` : null
      }
    });

    let checkoutUrl = null;
    
    // Intégration des APIs Wave / Orange Money Sénégal
    if (data.method === 'WAVE') {
      const session = await PaymentProviderService.createWaveSession(data.amount, payment.id);
      checkoutUrl = session.url;
    } else if (data.method === 'ORANGE_MONEY') {
      const session = await PaymentProviderService.createOMSession(data.amount, payment.id);
      checkoutUrl = session.url;
    }

    logger.info(`[Finance] Paiement ${payment.id} initié via ${data.method} (Montant: ${data.amount})`);
    return { payment, checkoutUrl };
  }

  /**
   * Statistiques financières avancées pour le Dashboard
   */
  static async getFinanceStats(tenantId: string) {
    const [payments, totalExpectedAggregate, studentsCount] = await Promise.all([
      prisma.payment.findMany({
        where: { 
          enrollment: { student: { school: { tenantId } } },
          status: 'COMPLETED'
        },
        include: { 
          enrollment: { 
            include: { student: true } 
          } 
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.enrollment.aggregate({
        where: { student: { school: { tenantId } } },
        _sum: { feesTotal: true }
      }),
      prisma.student.count({
        where: { school: { tenantId } }
      })
    ]);

    // Calcul par méthode de paiement
    const methodStats = await prisma.payment.groupBy({
      by: ['method'],
      where: { 
        enrollment: { student: { school: { tenantId } } },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    const collected = await prisma.payment.aggregate({
      where: { 
        enrollment: { student: { school: { tenantId } } },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    const totalCollected = Number(collected._sum.amount || 0);
    const totalExpected = Number(totalExpectedAggregate._sum.feesTotal || 0);
    const recoveryRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    return {
      collected: totalCollected,
      pending: Math.max(0, totalExpected - totalCollected),
      recoveryRate: Math.round(recoveryRate),
      studentsCount,
      recentTransactions: payments.map((p: any) => ({
        id: p.id,
        studentName: `${p.enrollment.student.firstName} ${p.enrollment.student.lastName}`,
        amount: Number(p.amount),
        method: p.method,
        date: p.paidAt,
        ref: p.providerRef
      })),
      byMethod: methodStats.map((m: any) => ({
        method: m.method,
        total: Number(m._sum.amount || 0)
      }))
    };
  }

  static async getPaymentsByEnrollment(enrollmentId: string) {
    return prisma.payment.findMany({
      where: { enrollmentId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async handleWebhook(body: any, signature: string | string[] | undefined, rawBody?: string) {
    this.assertValidWebhookSignature(signature, rawBody ?? JSON.stringify(body));

    const data = body;
    const paymentId = data.metadata?.paymentId || data.paymentId;

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: data.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
        paidAt: data.status === 'SUCCESS' ? new Date() : null,
        providerRef: data.transactionId || data.ref
      },
      include: { enrollment: { include: { student: true } } }
    });

    if (updatedPayment.status === 'COMPLETED') {
       logger.info(`[Finance] Paiement CONFIRMÉ : ${updatedPayment.amount} FCFA (ID: ${updatedPayment.id})`);
       
       // Notification au parent
       if (updatedPayment.enrollment.student.parentId) {
          await NotificationService.sendInApp({
            tenantId: updatedPayment.enrollment.student.schoolId, // Simplifié
            userId: updatedPayment.enrollment.student.parentId,
            title: 'Paiement Reçu',
            message: `Votre paiement de ${Number(updatedPayment.amount)} FCFA a été bien reçu. Merci.`,
            type: 'SUCCESS'
          });
       }
    }

    return updatedPayment;
  }
}
