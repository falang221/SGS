import { z } from 'zod';

export const StudentCreateSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  birthDate: z.string().transform((val) => new Date(val)),
  matricule: z.string().min(3),
  schoolId: z.string().uuid(),
});

export const EnrollmentCreateSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  yearId: z.string().min(9), // ex: 2024-2025
  feesTotal: z.number().positive(),
});
