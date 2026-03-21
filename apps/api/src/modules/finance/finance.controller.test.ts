import { FinanceController } from './finance.controller';
import { Request, Response } from 'express';
import { FinanceService } from '../../services/finance.service';
import { UnauthorizedError } from '../../shared/utils/errors';

describe('FinanceController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    res = {
      json: jsonMock,
      status: statusMock,
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('initiate', () => {
    it('doit initier un paiement par WAVE avec succès', async () => {
      req = {
        body: {
          enrollmentId: validUUID,
          amount: 50000,
          method: 'WAVE'
        },
        // @ts-ignore
        user: { id: 'user-1', tenantId: 'tenant-1' }
      };

      const mockPayment = { 
        id: 'pay-1', 
        enrollmentId: validUUID, 
        amount: 50000, 
        method: 'WAVE', 
        status: 'PENDING' 
      };

      jest.spyOn(FinanceService, 'initiatePayment').mockResolvedValue({
        payment: mockPayment as any,
        checkoutUrl: 'https://checkout.wave.sn/session/mock'
      });

      await FinanceController.initiate(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        payment: mockPayment,
        checkoutUrl: expect.stringContaining('checkout.wave.sn')
      }));
    });

    it('doit confirmer immédiatement un paiement en CASH', async () => {
      req = {
        body: {
          enrollmentId: validUUID,
          amount: 50000,
          method: 'CASH'
        },
        // @ts-ignore
        user: { id: 'user-1', tenantId: 'tenant-1' }
      };

      const mockPayment = { 
        id: 'pay-1', 
        enrollmentId: validUUID, 
        amount: 50000, 
        method: 'CASH', 
        status: 'COMPLETED' 
      };

      jest.spyOn(FinanceService, 'initiatePayment').mockResolvedValue({
        payment: mockPayment as any,
        checkoutUrl: null
      });

      await FinanceController.initiate(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        payment: mockPayment,
        checkoutUrl: null
      }));
    });
  });

  describe('handleWebhook', () => {
    it('délègue au service finance et retourne OK quand la signature est valide', async () => {
      req = {
        body: {
          transactionId: 'txn-1',
          status: 'SUCCESS',
          amount: 50000,
          metadata: {
            paymentId: validUUID,
          },
        },
        headers: {
          'x-webhook-signature': 'sha256=valid-signature',
        },
        rawBody: '{"transactionId":"txn-1","status":"SUCCESS","amount":50000,"metadata":{"paymentId":"550e8400-e29b-41d4-a716-446655440000"}}',
      };

      const handleWebhookSpy = jest.spyOn(FinanceService, 'handleWebhook').mockResolvedValue({} as never);

      await FinanceController.handleWebhook(req as Request, res as Response);

      expect(handleWebhookSpy).toHaveBeenCalledWith(
        req.body,
        'sha256=valid-signature',
        req.rawBody,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('OK');
    });

    it('retourne 401 si la signature webhook est invalide', async () => {
      req = {
        body: {
          transactionId: 'txn-1',
          status: 'SUCCESS',
          amount: 50000,
          metadata: {
            paymentId: validUUID,
          },
        },
        headers: {
          'x-webhook-signature': 'sha256=invalid',
        },
      };

      jest
        .spyOn(FinanceService, 'handleWebhook')
        .mockRejectedValue(new UnauthorizedError('Signature webhook invalide'));

      await FinanceController.handleWebhook(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Signature webhook invalide' });
    });
  });
});
