import { Request, Response } from 'express';
import { DashboardService } from '../../services/dashboard.service';
import { UnauthorizedError } from '../../shared/utils/errors';

export class DashboardController {
  
  static async getStats(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const stats = await DashboardService.getStats(req.user.tenantId);
      return res.json(stats);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ error: error.message || 'Erreur lors du calcul des statistiques' });
    }
  }
}
