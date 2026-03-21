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
exports.buildTenantScopeWhere = buildTenantScopeWhere;
exports.applySoftDeleteWhere = applySoftDeleteWhere;
exports.mergeTenantScopeWhere = mergeTenantScopeWhere;
const client_1 = require("@prisma/client");
const async_hooks_1 = require("async_hooks");
exports.prismaStorage = new async_hooks_1.AsyncLocalStorage();
const globalForPrisma = global;
const modelsWithoutSoftDelete = ['AuditLog', 'SystemSetting', 'Tenant'];
const tenantScopeBuilders = {
    User: (tenantId) => ({ tenantId }),
    School: (tenantId) => ({ tenantId }),
    Student: (tenantId) => ({ school: { tenantId } }),
    Class: (tenantId) => ({ school: { tenantId } }),
    Subject: (tenantId) => ({ school: { tenantId } }),
    Staff: (tenantId) => ({ school: { tenantId } }),
    Enrollment: (tenantId) => ({ student: { school: { tenantId } } }),
    Attendance: (tenantId) => ({ enrollment: { student: { school: { tenantId } } } }),
    Grade: (tenantId) => ({ enrollment: { student: { school: { tenantId } } } }),
    Payment: (tenantId) => ({ enrollment: { student: { school: { tenantId } } } }),
    TimetableEntry: (tenantId) => ({ class: { school: { tenantId } } }),
};
function buildTenantScopeWhere(model, tenantId) {
    if (!tenantId)
        return undefined;
    return tenantScopeBuilders[model]?.(tenantId);
}
function applySoftDeleteWhere(model, where) {
    if (modelsWithoutSoftDelete.includes(model)) {
        return where;
    }
    if (!where) {
        return { deletedAt: null };
    }
    return { AND: [where, { deletedAt: null }] };
}
function mergeTenantScopeWhere(model, where, tenantId) {
    const tenantWhere = buildTenantScopeWhere(model, tenantId);
    if (!tenantWhere) {
        return where;
    }
    if (!where) {
        return tenantWhere;
    }
    return { AND: [where, tenantWhere] };
}
function getRelationConnectId(data, relationKey) {
    return data[relationKey]?.connect?.id;
}
function getForeignKey(data, fieldKey, relationKey) {
    return data[fieldKey] ?? getRelationConnectId(data, relationKey);
}
const basePrisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
async function assertRecordInTenant(model, where, tenantId) {
    const tenantScopedWhere = mergeTenantScopeWhere(model, where, tenantId);
    const softDeletedScopedWhere = applySoftDeleteWhere(model, tenantScopedWhere);
    const existingRecord = await basePrisma[model].findFirst({
        where: softDeletedScopedWhere,
        select: { id: true },
    });
    if (!existingRecord) {
        throw new Error('Ressource introuvable pour ce tenant');
    }
    return existingRecord;
}
async function assertSchoolInTenant(schoolId, tenantId) {
    await assertRecordInTenant('School', { id: schoolId }, tenantId);
}
async function assertUserInTenant(userId, tenantId) {
    await assertRecordInTenant('User', { id: userId }, tenantId);
}
async function assertStudentInTenant(studentId, tenantId) {
    await assertRecordInTenant('Student', { id: studentId }, tenantId);
}
async function assertClassInTenant(classId, tenantId) {
    await assertRecordInTenant('Class', { id: classId }, tenantId);
}
async function assertSubjectInTenant(subjectId, tenantId) {
    await assertRecordInTenant('Subject', { id: subjectId }, tenantId);
}
async function assertStaffInTenant(staffId, tenantId) {
    await assertRecordInTenant('Staff', { id: staffId }, tenantId);
}
async function assertEnrollmentInTenant(enrollmentId, tenantId) {
    await assertRecordInTenant('Enrollment', { id: enrollmentId }, tenantId);
}
async function assertCreateDataInTenant(model, data, tenantId) {
    if (model === 'User' || model === 'School') {
        return;
    }
    if (model === 'Student' || model === 'Class' || model === 'Subject') {
        const schoolId = getForeignKey(data, 'schoolId', 'school');
        if (!schoolId)
            throw new Error(`schoolId est requis pour créer ${model}`);
        await assertSchoolInTenant(schoolId, tenantId);
        return;
    }
    if (model === 'Staff') {
        const schoolId = getForeignKey(data, 'schoolId', 'school');
        if (!schoolId)
            throw new Error('schoolId est requis pour créer Staff');
        await assertSchoolInTenant(schoolId, tenantId);
        const userId = getForeignKey(data, 'userId', 'user');
        if (userId) {
            await assertUserInTenant(userId, tenantId);
        }
        return;
    }
    if (model === 'Enrollment') {
        const studentId = getForeignKey(data, 'studentId', 'student');
        const classId = getForeignKey(data, 'classId', 'class');
        if (!studentId || !classId) {
            throw new Error('studentId et classId sont requis pour créer Enrollment');
        }
        await Promise.all([assertStudentInTenant(studentId, tenantId), assertClassInTenant(classId, tenantId)]);
        return;
    }
    if (model === 'Attendance' || model === 'Grade' || model === 'Payment') {
        const enrollmentId = getForeignKey(data, 'enrollmentId', 'enrollment');
        if (!enrollmentId)
            throw new Error(`enrollmentId est requis pour créer ${model}`);
        await assertEnrollmentInTenant(enrollmentId, tenantId);
        return;
    }
    if (model === 'TimetableEntry') {
        const classId = getForeignKey(data, 'classId', 'class');
        const subjectId = getForeignKey(data, 'subjectId', 'subject');
        const staffId = getForeignKey(data, 'staffId', 'staff');
        if (!classId || !subjectId || !staffId) {
            throw new Error('classId, subjectId et staffId sont requis pour créer TimetableEntry');
        }
        await Promise.all([
            assertClassInTenant(classId, tenantId),
            assertSubjectInTenant(subjectId, tenantId),
            assertStaffInTenant(staffId, tenantId),
        ]);
    }
}
/**
 * Extension Prisma pour gérer :
 * 1. Soft Delete automatique (recherche et suppression)
 * 2. Isolation Multi-tenant au niveau ORM
 */
exports.extendedPrisma = basePrisma.$extends({
    query: {
        $allModels: {
            async delete({ model, args }) {
                const context = exports.prismaStorage.getStore();
                const tenantId = context?.tenantId;
                const isSuperAdmin = context?.role === 'SUPER_ADMIN';
                if (tenantId && !isSuperAdmin && buildTenantScopeWhere(model, tenantId)) {
                    const existingRecord = await assertRecordInTenant(model, args.where, tenantId);
                    return basePrisma[model].update({
                        ...args,
                        where: { id: existingRecord.id },
                        data: { deletedAt: new Date() },
                    });
                }
                return basePrisma[model].update({
                    ...args,
                    data: { deletedAt: new Date() },
                });
            },
            async deleteMany({ model, args }) {
                const context = exports.prismaStorage.getStore();
                const tenantId = context?.tenantId;
                const isSuperAdmin = context?.role === 'SUPER_ADMIN';
                if (tenantId && !isSuperAdmin) {
                    args.where = mergeTenantScopeWhere(model, args.where, tenantId);
                }
                return basePrisma[model].updateMany({
                    ...args,
                    data: { deletedAt: new Date() },
                });
            },
            async $allOperations({ model, operation, args, query }) {
                const context = exports.prismaStorage.getStore();
                const a = args;
                const isSuperAdmin = context?.role === 'SUPER_ADMIN';
                const tenantId = context?.tenantId;
                const tenantScope = buildTenantScopeWhere(model, tenantId);
                // 1. Gestion du Soft Delete
                if (!modelsWithoutSoftDelete.includes(model) &&
                    ['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'].includes(operation)) {
                    a.where = applySoftDeleteWhere(model, a.where);
                }
                // 2. Isolation Multi-tenant
                // On BYPASS l'isolation si l'utilisateur est SUPER_ADMIN
                if (tenantId && !isSuperAdmin && tenantScope) {
                    if (['findMany', 'findFirst', 'count', 'aggregate', 'groupBy', 'updateMany', 'deleteMany']
                        .includes(operation)) {
                        a.where = mergeTenantScopeWhere(model, a.where, tenantId);
                    }
                    if (operation === 'findUnique') {
                        return basePrisma[model].findFirst({
                            ...a,
                            where: applySoftDeleteWhere(model, mergeTenantScopeWhere(model, a.where, tenantId)),
                        });
                    }
                    if (operation === 'update') {
                        const existingRecord = await assertRecordInTenant(model, a.where, tenantId);
                        return basePrisma[model].update({
                            ...a,
                            where: { id: existingRecord.id },
                        });
                    }
                    if (operation === 'create') {
                        if (model === 'User' || model === 'School') {
                            a.data = { ...a.data, tenantId };
                        }
                        else {
                            await assertCreateDataInTenant(model, a.data, tenantId);
                        }
                    }
                    if (operation === 'createMany') {
                        const records = Array.isArray(a.data) ? a.data : [a.data];
                        if (model === 'User' || model === 'School') {
                            a.data = records.map((record) => ({ ...record, tenantId }));
                        }
                        else {
                            for (const record of records) {
                                await assertCreateDataInTenant(model, record, tenantId);
                            }
                        }
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
