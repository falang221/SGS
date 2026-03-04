import { PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'async_hooks';

// Context pour le Multi-tenancy
export interface PrismaContext {
  tenantId?: string;
  userId?: string;
}

export const prismaStorage = new AsyncLocalStorage<PrismaContext>();

const globalForPrisma = global as unknown as { prisma: any }

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

/**
 * Extension Prisma pour gérer :
 * 1. Soft Delete automatique (recherche et suppression)
 * 2. Isolation Multi-tenant au niveau ORM (Uniquement sur les modèles racines)
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

        // 1. Gestion du Soft Delete (Partout)
        if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy'].includes(operation)) {
          a.where = { ...a.where, deletedAt: null };
        }

        // 2. Isolation Multi-tenant (Uniquement modèles possédant tenantId)
        const modelsWithTenant = ['User', 'School', 'Tenant']; 
        
        if (context?.tenantId && modelsWithTenant.includes(model)) {
          if (['findMany', 'findFirst', 'findUnique', 'count', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
            a.where = { ...a.where, tenantId: context.tenantId };
          }
          if (operation === 'create' && model !== 'Tenant') {
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
