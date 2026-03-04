import { Request, Response } from 'express';
import { BulkAttendanceSchema } from './attendance.dto';
import { AttendanceService } from '../../services/attendance.service';
import { UnauthorizedError } from '../../shared/utils/errors';

export class AttendanceController {
  
  static async submitBulk(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = BulkAttendanceSchema.parse(req.body);
      
      const result = await AttendanceService.submitBulk(data, req.user.id, req.user.tenantId);

      return res.status(201).json({ 
        message: `${result.length} présences enregistrées.`,
        data: result 
      });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  }

  static async getHistoryByEnrollment(req: Request, res: Response) {
    const { enrollmentId } = req.params;
    try {
      const history = await AttendanceService.getHistoryByEnrollment(enrollmentId);
      return res.json(history);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des présences' });
    }
  }

  static async getDailyStats(req: Request, res: Response) {
    const { schoolId } = req.params;
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    try {
      const stats = await AttendanceService.getDailyStats(schoolId, date);
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erreur lors du calcul des statistiques de présence' });
    }
  }
}
