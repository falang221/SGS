import { Request, Response } from 'express';
import { TenantCreateSchema, SchoolCreateSchema } from './tenant.dto';
import { TenantService } from '../../services/tenant.service';
import { AuditService } from '../../shared/utils/audit.service';

export class TenantController {
  
  static async create(req: Request, res: Response) {
    try {
      const data = TenantCreateSchema.parse(req.body);
      const result = await TenantService.createTenant(data);

      await AuditService.log({
        userId: (req.user as any)?.id,
        action: 'TENANT_CREATE',
        resource: 'TENANT',
        newValue: { name: data.name, slug: data.slug },
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const tenants = await TenantService.listAllTenants();
      return res.json(tenants);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async addSchool(req: Request, res: Response) {
    try {
      const data = SchoolCreateSchema.parse(req.body);
      const school = await TenantService.addSchoolToTenant(data);

      await AuditService.log({
        userId: (req.user as any)?.id,
        action: 'SCHOOL_CREATE',
        resource: 'SCHOOL',
        newValue: { name: data.name, tenantId: data.tenantId },
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.status(201).json(school);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
