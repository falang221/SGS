import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import dotenv from 'dotenv';
import { prisma, prismaStorage } from '@school-mgmt/shared';
import { logger } from './shared/utils/logger';
import { AuditService } from './shared/utils/audit.service';
import authRoutes from './modules/auth/auth.router';
import academicRoutes from './modules/academic/academic.router';
import studentRoutes from './modules/students/student.router';
import gradeRoutes from './modules/grades/grade.router';
import financeRoutes from './modules/finance/finance.router';
import hrRoutes from './modules/hr/hr.router';
import attendanceRoutes from './modules/attendance/attendance.router';
import parentRoutes from './modules/parent/parent.router';
import dashboardRoutes from './modules/dashboard/dashboard.router';
import schoolRoutes from './modules/school/school.router';
import tenantRoutes from './modules/tenant/tenant.router';
import systemRoutes from './modules/system/system.router';
import { errorHandler } from './middlewares/error.middleware';

import { createServer } from 'http';
import { initSocket } from './modules/notifications/socket.service';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './shared/utils/swagger';

dotenv.config();

const app = express();
// ... rest of code

// --- DOCUMENTATION API ---
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const httpServer = createServer(app); // Créer le serveur HTTP
const io = initSocket(httpServer); // Initialiser Socket.io (Section 6.2)
const PORT = process.env.PORT || 3001;

// Middlewares de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({ method: req.method, url: req.url, tenantId: req.headers['x-tenant-id'] });
  next();
});

// Middleware de Contexte Prisma (Multi-tenant & Audit)
app.use((req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  // Le userId sera injecté par l'authMiddleware plus tard, 
  // mais on initialise le stockage ici pour le tenantId
  prismaStorage.run({ tenantId }, () => {
    next();
  });
});

// Middleware d'Audit (Amélioré - Se déclenche après la réponse)
const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.user && res.statusCode < 400) {
      AuditService.log({
        userId: req.user.id,
        action: `${req.method} ${req.originalUrl}`,
        resource: req.path.split('/')[3] || 'unknown',
        ipAddress: req.ip,
        newValue: req.body
      }).catch(err => logger.error('AuditLog Error:', err));
    }
  });
  next();
};


// Route de santé (Exclue du tenant-check)
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- ROUTES PUBLIQUES ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/finance/webhooks', financeRoutes); // Inclusion du webhook finance sans tenant-id

// --- MIDDLEWARE MULTI-TENANT (Vérification obligatoire pour le reste) ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID est requis (x-tenant-id)' });
  }
  req.tenantId = tenantId;
  next();
});

// --- ROUTES PROTÉGÉES ---
app.use(auditMiddleware); // Audit systématique des actions mutables
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/grades', gradeRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/hr', hrRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/school', schoolRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/system', systemRoutes);

// --- GESTION DES ERREURS GLOBALE ---
app.use(errorHandler);

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`🚀 Serveur API & Socket.io Gestion Scolaire démarré sur le port ${PORT}`);
});

export { logger, prisma };
