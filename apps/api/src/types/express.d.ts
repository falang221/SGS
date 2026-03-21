import { Role } from '@school-mgmt/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string;
        schoolId?: string;
        role: Role;
        permissions: string[];
      };
      tenantId?: string;
      rawBody?: string;
    }
  }
}
