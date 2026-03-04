import { z } from 'zod';

export const AttendanceCreateSchema = z.object({
  enrollmentId: z.string().uuid(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  reason: z.string().optional(),
});

export const BulkAttendanceSchema = z.array(AttendanceCreateSchema);
