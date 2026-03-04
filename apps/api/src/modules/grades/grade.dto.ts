import { z } from 'zod';

export const GradeCreateSchema = z.object({
  enrollmentId: z.string().uuid(),
  subjectId: z.string(),
  value: z.number().min(0).max(20), // Notation sur 20 (Sénégal)
  coeff: z.number().int().min(1).default(1),
  period: z.string(), // ex: "Trimestre 1"
  type: z.enum(['DEVOIR', 'COMPOSITION', 'TEST']),
});

export const BatchGradeSchema = z.object({
  subjectId: z.string(),
  classId: z.string().uuid(),
  period: z.string(),
  type: z.enum(['DEVOIR', 'COMPOSITION', 'TEST']),
  yearId: z.string(),
  grades: z.array(z.object({
    enrollmentId: z.string().uuid(),
    value: z.number().min(0).max(20),
    coeff: z.number().int().min(1).optional()
  }))
});

export const RankingQuerySchema = z.object({
  classId: z.string().uuid(),
  period: z.string(),
});

export const ReportGenerateSchema = z.object({
  schoolId: z.string().uuid(),
  yearId: z.string(),
  period: z.string(),
  classId: z.string().uuid().optional(),
});
