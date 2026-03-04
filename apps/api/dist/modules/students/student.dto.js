"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentCreateSchema = exports.StudentCreateSchema = void 0;
const zod_1 = require("zod");
exports.StudentCreateSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    birthDate: zod_1.z.string().transform((val) => new Date(val)),
    matricule: zod_1.z.string().min(3),
    schoolId: zod_1.z.string().uuid(),
});
exports.EnrollmentCreateSchema = zod_1.z.object({
    studentId: zod_1.z.string().uuid(),
    classId: zod_1.z.string().uuid(),
    yearId: zod_1.z.string().min(9), // ex: 2024-2025
    feesTotal: zod_1.z.number().positive(),
});
