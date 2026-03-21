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
const modelsWithoutSoftDelete = ['AuditLog', 'SystemSetting', 'Tenant'];

const tenantScopeBuilders: Record<string, (tenantId: string) => Record<string, unknown>> = {
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

export function buildTenantScopeWhere(
  model: string,
  tenantId?: string,
): Record<string, unknown> | undefined {
  if (!tenantId) return undefined;
  return tenantScopeBuilders[model]?.(tenantId);
}

export function applySoftDeleteWhere(
  model: string,
  where?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (modelsWithoutSoftDelete.includes(model)) {
    return where;
  }

  if (!where) {
    return { deletedAt: null };
  }

  return { AND: [where, { deletedAt: null }] };
}

export function mergeTenantScopeWhere(
  model: string,
  where?: Record<string, unknown>,
  tenantId?: string,
): Record<string, unknown> | undefined {
  const tenantWhere = buildTenantScopeWhere(model, tenantId);
  if (!tenantWhere) {
    return where;
  }

  if (!where) {
    return tenantWhere;
  }

  return { AND: [where, tenantWhere] };
}

function getRelationConnectId(data: Record<string, any>, relationKey: string): string | undefined {
  return data[relationKey]?.connect?.id;
}

function getForeignKey(data: Record<string, any>, fieldKey: string, relationKey: string): string | undefined {
  return data[fieldKey] ?? getRelationConnectId(data, relationKey);
}

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

async function assertRecordInTenant(model: string, where: Record<string, unknown>, tenantId: string) {
  const tenantScopedWhere = mergeTenantScopeWhere(model, where, tenantId);
  const softDeletedScopedWhere = applySoftDeleteWhere(model, tenantScopedWhere);

  const existingRecord = await (basePrisma as any)[model].findFirst({
    where: softDeletedScopedWhere,
    select: { id: true },
  });

  if (!existingRecord) {
    throw new Error('Ressource introuvable pour ce tenant');
  }

  return existingRecord;
}

async function assertSchoolInTenant(schoolId: string, tenantId: string) {
  await assertRecordInTenant('School', { id: schoolId }, tenantId);
}

async function assertUserInTenant(userId: string, tenantId: string) {
  await assertRecordInTenant('User', { id: userId }, tenantId);
}

async function assertStudentInTenant(studentId: string, tenantId: string) {
  await assertRecordInTenant('Student', { id: studentId }, tenantId);
}

async function assertClassInTenant(classId: string, tenantId: string) {
  await assertRecordInTenant('Class', { id: classId }, tenantId);
}

async function assertSubjectInTenant(subjectId: string, tenantId: string) {
  await assertRecordInTenant('Subject', { id: subjectId }, tenantId);
}

async function assertStaffInTenant(staffId: string, tenantId: string) {
  await assertRecordInTenant('Staff', { id: staffId }, tenantId);
}

async function assertEnrollmentInTenant(enrollmentId: string, tenantId: string) {
  await assertRecordInTenant('Enrollment', { id: enrollmentId }, tenantId);
}

async function assertCreateDataInTenant(model: string, data: Record<string, any>, tenantId: string) {
  if (model === 'User' || model === 'School') {
    return;
  }

  if (model === 'Student' || model === 'Class' || model === 'Subject') {
    const schoolId = getForeignKey(data, 'schoolId', 'school');
    if (!schoolId) throw new Error(`schoolId est requis pour créer ${model}`);
    await assertSchoolInTenant(schoolId, tenantId);
    return;
  }

  if (model === 'Staff') {
    const schoolId = getForeignKey(data, 'schoolId', 'school');
    if (!schoolId) throw new Error('schoolId est requis pour créer Staff');
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
    if (!enrollmentId) throw new Error(`enrollmentId est requis pour créer ${model}`);
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
export const extendedPrisma = basePrisma.$extends({
  query: {
    $allModels: {
      async delete({ model, args }) {
        const context = prismaStorage.getStore();
        const tenantId = context?.tenantId;
        const isSuperAdmin = context?.role === 'SUPER_ADMIN';

        if (tenantId && !isSuperAdmin && buildTenantScopeWhere(model, tenantId)) {
          const existingRecord = await assertRecordInTenant(model, (args as any).where, tenantId);

          return (basePrisma as any)[model].update({
            ...(args as any),
            where: { id: existingRecord.id },
            data: { deletedAt: new Date() },
          });
        }

        return (basePrisma as any)[model].update({
          ...args,
          data: { deletedAt: new Date() },
        });
      },
      async deleteMany({ model, args }) {
        const context = prismaStorage.getStore();
        const tenantId = context?.tenantId;
        const isSuperAdmin = context?.role === 'SUPER_ADMIN';

        if (tenantId && !isSuperAdmin) {
          (args as any).where = mergeTenantScopeWhere(model, (args as any).where, tenantId);
        }

        return (basePrisma as any)[model].updateMany({
          ...args,
          data: { deletedAt: new Date() },
        });
      },
      
      async $allOperations({ model, operation, args, query }) {
        const context = prismaStorage.getStore();
        const a = args as any;
        const isSuperAdmin = context?.role === 'SUPER_ADMIN';
        const tenantId = context?.tenantId;
        const tenantScope = buildTenantScopeWhere(model, tenantId);

        // 1. Gestion du Soft Delete
        if (
          !modelsWithoutSoftDelete.includes(model) &&
          ['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'].includes(operation)
        ) {
          a.where = applySoftDeleteWhere(model, a.where);
        }

        // 2. Isolation Multi-tenant
        // On BYPASS l'isolation si l'utilisateur est SUPER_ADMIN
        if (tenantId && !isSuperAdmin && tenantScope) {
          if (
            ['findMany', 'findFirst', 'count', 'aggregate', 'groupBy', 'updateMany', 'deleteMany']
              .includes(operation)
          ) {
            a.where = mergeTenantScopeWhere(model, a.where, tenantId);
          }

          if (operation === 'findUnique') {
            return (basePrisma as any)[model].findFirst({
              ...a,
              where: applySoftDeleteWhere(model, mergeTenantScopeWhere(model, a.where, tenantId)),
            });
          }

          if (operation === 'update') {
            const existingRecord = await assertRecordInTenant(model, a.where, tenantId);
            return (basePrisma as any)[model].update({
              ...a,
              where: { id: existingRecord.id },
            });
          }

          if (operation === 'create') {
            if (model === 'User' || model === 'School') {
              a.data = { ...a.data, tenantId };
            } else {
              await assertCreateDataInTenant(model, a.data, tenantId);
            }
          }

          if (operation === 'createMany') {
            const records = Array.isArray(a.data) ? a.data : [a.data];

            if (model === 'User' || model === 'School') {
              a.data = records.map((record: Record<string, unknown>) => ({ ...record, tenantId }));
            } else {
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

export const prisma = globalForPrisma.prisma || extendedPrisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'
