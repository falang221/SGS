import { z } from 'zod';

export const TimetableCreateSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  staffId: z.string().uuid(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  room: z.string().optional(),
});

export const SubjectCreateSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(2),
  code: z.string().optional(),
  coefficient: z.number().int().min(1).default(1),
});
