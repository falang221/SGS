import { AsyncLocalStorage } from 'async_hooks';
export interface PrismaContext {
    tenantId?: string;
    userId?: string;
    role?: string;
}
export declare const prismaStorage: AsyncLocalStorage<PrismaContext>;
export declare function buildTenantScopeWhere(model: string, tenantId?: string): Record<string, unknown> | undefined;
export declare function applySoftDeleteWhere(model: string, where?: Record<string, unknown>): Record<string, unknown> | undefined;
export declare function mergeTenantScopeWhere(model: string, where?: Record<string, unknown>, tenantId?: string): Record<string, unknown> | undefined;
/**
 * Extension Prisma pour gérer :
 * 1. Soft Delete automatique (recherche et suppression)
 * 2. Isolation Multi-tenant au niveau ORM
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
