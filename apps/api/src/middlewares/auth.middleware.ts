import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma, prismaStorage } from '@school-mgmt/shared';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-default';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé' });
  }

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
    
    // Injecter l'utilisateur et le tenant dans la requête
    req.user = {
      id: payload.sub,
      tenantId: payload.tenantId,
      schoolId: payload.schoolId,
      role: payload.role as any,
      permissions: payload.permissions
    };

    // Mettre à jour le contexte Prisma
    const context = prismaStorage.getStore();
    if (context) {
      context.userId = payload.sub;
      context.tenantId = payload.tenantId; // On s'assure qu'il est là
      context.role = payload.role; // Crucial pour le bypass SUPER_ADMIN
    }

    // Vérifier si le tenant_id correspond au header (RLS Simulation)
    if (req.headers['x-tenant-id'] !== payload.tenantId) {
       return res.status(403).json({ error: 'Incohérence du Tenant ID' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session expirée ou invalide' });
  }
};

// Middleware RBAC (Rôles)
export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    next();
  };
};
