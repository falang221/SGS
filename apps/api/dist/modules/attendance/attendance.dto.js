"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkAttendanceSchema = exports.AttendanceCreateSchema = void 0;
const zod_1 = require("zod");
exports.AttendanceCreateSchema = zod_1.z.object({
    enrollmentId: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    reason: zod_1.z.string().optional(),
});
exports.BulkAttendanceSchema = zod_1.z.array(exports.AttendanceCreateSchema);
