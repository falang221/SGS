import crypto from 'crypto';
import { FinanceService } from './finance.service';
import { prismaMock } from '../test/setup';
import { NotificationService } from '../modules/notifications/notification.service';

jest.mock('../modules/notifications/notification.service', () => ({
  NotificationService: {
    sendInApp: jest.fn(),
    notifyPaymentReminder: jest.fn(),
  },
}));

describe('FinanceService.handleWebhook', () => {
  const rawBody =
    '{"transactionId":"txn-1","status":"SUCCESS","amount":50000,"metadata":{"paymentId":"550e8400-e29b-41d4-a716-446655440000"}}';
  const body = {
    transactionId: 'txn-1',
    status: 'SUCCESS',
    amount: 50000,
    metadata: {
      paymentId: '550e8400-e29b-41d4-a716-446655440000',
    },
  };

  beforeEach(() => {
    process.env.PAYMENT_WEBHOOK_SECRET = 'test-webhook-secret';
    jest.clearAllMocks();
  });

  it('rejette les signatures invalides avant toute mise à jour Prisma', async () => {
    await expect(FinanceService.handleWebhook(body, 'sha256=invalid-signature', rawBody)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Signature webhook invalide',
    });

    expect(prismaMock.payment.update).not.toHaveBeenCalled();
  });

  it('accepte une signature HMAC valide et met à jour le paiement', async () => {
    const signature = crypto
      .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET as string)
      .update(rawBody)
      .digest('hex');

    prismaMock.payment.update.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 50000,
      status: 'COMPLETED',
      enrollment: {
        student: {
          parentId: 'parent-1',
          schoolId: 'school-1',
        },
      },
    } as never);

    await FinanceService.handleWebhook(body, `sha256=${signature}`, rawBody);

    expect(prismaMock.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '550e8400-e29b-41d4-a716-446655440000' },
      }),
    );
    expect(NotificationService.sendInApp).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'parent-1',
      }),
    );
  });
});
