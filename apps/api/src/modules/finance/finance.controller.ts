import { Request, Response } from 'express';
import { PaymentInitiateSchema, WebhookPaymentSchema } from './finance.dto';
import { FinanceService } from '../../services/finance.service';
import { UnauthorizedError } from '../../shared/utils/errors';

export class FinanceController {
  
  static async sendReminders(req: Request, res: Response) {
    const { schoolId } = req.body;
    if (!req.user) throw new UnauthorizedError();

    try {
      const count = await FinanceService.sendReminders(schoolId, req.user.tenantId);
      return res.json({ message: `${count} rappels envoyés.` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async initiate(req: Request, res: Response) {
    try {
      const data = PaymentInitiateSchema.parse(req.body);
      if (!req.user) throw new UnauthorizedError();

      const { payment, checkoutUrl } = await FinanceService.initiatePayment(data, req.user.id, req.ip || '0.0.0.0');

      return res.status(201).json({ 
        payment, 
        checkoutUrl,
        message: data.method === 'CASH' ? 'Paiement enregistré avec succès.' : 'Redirection vers la passerelle de paiement.'
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async handleWebhook(req: Request, res: Response) {
     try {
       const signature = req.headers['x-webhook-signature'];
       const data = WebhookPaymentSchema.parse(req.body);
       
       await FinanceService.handleWebhook(data, signature);

       return res.status(200).send('OK');
     } catch (error: any) {
       return res.status(400).json({ error: error.message || 'Données de webhook invalides' });
     }
  }

  static async listByEnrollment(req: Request, res: Response) {
    const { enrollmentId } = req.params;
    try {
       const payments = await FinanceService.getPaymentsByEnrollment(enrollmentId);
       return res.json(payments);
    } catch (error: any) {
       return res.status(500).json({ error: 'Erreur lors de la récupération des paiements' });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const stats = await FinanceService.getFinanceStats(req.user.tenantId);
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Erreur lors du calcul des statistiques financières' });
    }
  }
}
