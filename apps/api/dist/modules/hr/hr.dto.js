"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollGenerateSchema = exports.StaffCreateSchema = void 0;
const zod_1 = require("zod");
exports.StaffCreateSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    role: zod_1.z.string(), // ex: "Enseignant Mathématiques"
    schoolId: zod_1.z.string().uuid(),
    salary: zod_1.z.number().optional(),
    contractType: zod_1.z.enum(['CDI', 'CDD', 'PRESTATAIRE', 'STAGE']).optional(),
});
exports.PayrollGenerateSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    month: zod_1.z.number().min(1).max(12),
    year: zod_1.z.number().min(2023),
});
