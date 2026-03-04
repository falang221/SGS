"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectCreateSchema = exports.TimetableCreateSchema = void 0;
const zod_1 = require("zod");
exports.TimetableCreateSchema = zod_1.z.object({
    classId: zod_1.z.string().uuid(),
    subjectId: zod_1.z.string().uuid(),
    staffId: zod_1.z.string().uuid(),
    dayOfWeek: zod_1.z.number().min(0).max(6),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    room: zod_1.z.string().optional(),
});
exports.SubjectCreateSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(2),
    code: zod_1.z.string().optional(),
    coefficient: zod_1.z.number().int().min(1).default(1),
});
