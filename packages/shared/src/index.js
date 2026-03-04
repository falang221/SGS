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
exports.prisma = exports.extendedPrisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = global;
const basePrisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
/**
 * Extension Prisma pour gérer :
 * 1. Soft Delete automatique (recherche et suppression)
 * 2. [À venir] Isolation Multi-tenant au niveau ORM
 */
exports.extendedPrisma = basePrisma.$extends({
    query: {
        $allModels: {
            // Transformation des suppressions physiques en suppressions logiques
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
                return basePrisma[model].findFirst({
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
exports.prisma = globalForPrisma.prisma || exports.extendedPrisma;
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
__exportStar(require("@prisma/client"), exports);
