/**
 * Extension Prisma pour gérer :
 * 1. Soft Delete automatique (recherche et suppression)
 * 2. [À venir] Isolation Multi-tenant au niveau ORM
 */
export declare const extendedPrisma: import("@prisma/client/runtime/library").DynamicClientExtensionThis<import("@prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
    result: {};
    model: {};
    query: {};
    client: {};
}, import("@prisma/client").Prisma.PrismaClientOptions>, import("@prisma/client").Prisma.TypeMapCb, {
    result: {};
    model: {};
    query: {};
    client: {};
}, {}>;
export declare const prisma: any;
export * from '@prisma/client';
