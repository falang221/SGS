import { Request, Response } from 'express';
import { StaffCreateSchema, PayrollGenerateSchema } from './hr.dto';
import { HRService } from '../../services/hr.service';
import { UnauthorizedError } from '../../shared/utils/errors';
import { AuditService } from '../../shared/utils/audit.service';

export class HRController {
  
  static async createStaff(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = StaffCreateSchema.parse(req.body);
      
      const result = await HRService.createStaff(data, req.user.tenantId);

      await AuditService.log({
        userId: req.user.id,
        action: 'STAFF_CREATE',
        resource: 'STAFF',
        newValue: { staffId: result.id, email: data.email, role: data.role },
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async listBySchool(req: Request, res: Response) {
    const { schoolId } = req.params;
    try {
      const staffList = await HRService.listStaff(schoolId);
      return res.json(staffList);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du personnel' });
    }
  }

  static async getStats(req: Request, res: Response) {
    const { schoolId } = req.params;
    try {
      const stats = await HRService.getHRStats(schoolId);
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erreur lors du calcul des statistiques RH' });
    }
  }

  static async generatePayroll(req: Request, res: Response) {
    try {
      const data = PayrollGenerateSchema.parse(req.body);
      const result = await HRService.generatePayrollRecord(data);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
