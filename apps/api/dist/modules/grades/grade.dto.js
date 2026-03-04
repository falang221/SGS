"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerateSchema = exports.GradeCreateSchema = void 0;
const zod_1 = require("zod");
exports.GradeCreateSchema = zod_1.z.object({
    enrollmentId: zod_1.z.string().uuid(),
    subjectId: zod_1.z.string(),
    value: zod_1.z.number().min(0).max(20), // Notation sur 20 (Sénégal)
    coeff: zod_1.z.number().int().min(1).default(1),
    period: zod_1.z.string(), // ex: "Trimestre 1"
    type: zod_1.z.enum(['DEVOIR', 'COMPOSITION', 'TEST']),
});
exports.ReportGenerateSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    yearId: zod_1.z.string(),
    period: zod_1.z.string(),
    classId: zod_1.z.string().uuid().optional(),
});
