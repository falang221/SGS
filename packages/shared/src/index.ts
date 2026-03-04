import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: any }

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

/**
 * Extension Prisma pour gérer :
 * 1. Soft Delete automatique (recherche et suppression)
 * 2. [À venir] Isolation Multi-tenant au niveau ORM
 */
export const extendedPrisma = basePrisma.$extends({
  query: {
    $allModels: {
      // Transformation des suppressions physiques en suppressions logiques
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
      // Filtrage automatique des records supprimés pour toutes les lectures
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ model, args }) {
        // findUnique ne permet pas de filtrage complexe (seulement PK ou index unique)
        // On le transforme en findFirst pour autoriser le filtre 'deletedAt: null'
        return (basePrisma as any)[model].findFirst({
          ...args,
          where: { ...args.where, deletedAt: null }
        });
      },
      async count({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});

export const prisma = globalForPrisma.prisma || extendedPrisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'
