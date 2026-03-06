import { PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'async_hooks';

// Context pour le Multi-tenancy
export interface PrismaContext {
  tenantId?: string;
  userId?: string;
  role?: string;
}

export const prismaStorage = new AsyncLocalStorage<PrismaContext>();

const globalForPrisma = global as unknown as { prisma: any }

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

/**
 * Extension Prisma pour gérer :
 * 1. Soft Delete automatique (recherche et suppression)
 * 2. Isolation Multi-tenant au niveau ORM
 */
export const extendedPrisma = basePrisma.$extends({
  query: {
    $allModels: {
      async delete({ model, args }) {
        return (basePrisma as any)[model].update({
          ...args,
          data: { deletedAt: new Date() },
        });
      },
      async deleteMany({ model, args }) {
        return (basePrisma as any)[model].updateMany({
          ...args,
          data: { deletedAt: new Date() },
        });
      },
      
      async $allOperations({ model, operation, args, query }) {
        const context = prismaStorage.getStore();
        const a = args as any;
        const isSuperAdmin = context?.role === 'SUPER_ADMIN';

        // 1. Gestion du Soft Delete
        const modelsWithoutSoftDelete = ['AuditLog', 'SystemSetting', 'Tenant'];
        if (
          !modelsWithoutSoftDelete.includes(model) &&
          ['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'].includes(operation)
        ) {
          a.where = { ...a.where, deletedAt: null };
        }

        // 2. Isolation Multi-tenant
        // On BYPASS l'isolation si l'utilisateur est SUPER_ADMIN
        const modelsWithTenantId = [
          'User', 'School', 'Student', 'Class', 'Staff', 
          'Subject', 'TimetableEntry', 'Attendance', 'Grade', 'Payment',
          'Enrollment'
        ];

        if (context?.tenantId && !isSuperAdmin && modelsWithTenantId.includes(model)) {
          if (['findMany', 'findFirst', 'count', 'updateMany', 'deleteMany'].includes(operation)) {
            a.where = { ...a.where, tenantId: context.tenantId };
          }
          if (operation === 'create') {
            a.data = { ...a.data, tenantId: context.tenantId };
          }
        }

        return query(a);
      },
    },
  },
});

export const prisma = globalForPrisma.prisma || extendedPrisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'
