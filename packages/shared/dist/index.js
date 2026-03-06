"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.extendedPrisma = exports.prismaStorage = void 0;
const client_1 = require("@prisma/client");
const async_hooks_1 = require("async_hooks");
exports.prismaStorage = new async_hooks_1.AsyncLocalStorage();
const globalForPrisma = global;
const basePrisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
/**
 * Extension Prisma pour gérer :
 * 1. Soft Delete automatique (recherche et suppression)
 * 2. Isolation Multi-tenant au niveau ORM
 */
exports.extendedPrisma = basePrisma.$extends({
    query: {
        $allModels: {
            async delete({ model, args }) {
                return basePrisma[model].update({
                    ...args,
                    data: { deletedAt: new Date() },
                });
            },
            async deleteMany({ model, args }) {
                return basePrisma[model].updateMany({
                    ...args,
                    data: { deletedAt: new Date() },
                });
            },
            async $allOperations({ model, operation, args, query }) {
                const context = exports.prismaStorage.getStore();
                const a = args;
                const isSuperAdmin = context?.role === 'SUPER_ADMIN';
                // 1. Gestion du Soft Delete
                const modelsWithoutSoftDelete = ['AuditLog', 'SystemSetting', 'Tenant'];
                if (!modelsWithoutSoftDelete.includes(model) &&
                    ['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'].includes(operation)) {
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
exports.prisma = globalForPrisma.prisma || exports.extendedPrisma;
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
__exportStar(require("@prisma/client"), exports);
