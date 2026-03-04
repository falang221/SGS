import { Request, Response } from 'express';
import { SchoolService } from '../../services/school.service';
import { UnauthorizedError } from '../../shared/utils/errors';

export class SchoolController {
  static async listByTenant(req: Request, res: Response) {
    const { tenantId } = req.params;
    try {
      const schools = await SchoolService.listByTenant(tenantId);
      return res.json(schools);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    const { schoolId } = req.params;
    try {
      const school = await SchoolService.getById(schoolId);
      return res.json(school);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateConfig(req: Request, res: Response) {
    const { schoolId } = req.params;
    try {
      const school = await SchoolService.updateConfig(schoolId, req.body);
      return res.json(school);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getYears(req: Request, res: Response) {
    const { schoolId } = req.params;
    try {
      const years = await SchoolService.listYears(schoolId);
      return res.json(years);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
