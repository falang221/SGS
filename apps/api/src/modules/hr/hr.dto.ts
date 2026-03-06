import { z } from 'zod';

export const StaffCreateSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.string(), // ex: "Enseignant Mathématiques"
  schoolId: z.string().uuid(),
  salary: z.number().min(0).optional(),
  contractType: z.enum(['CDI', 'CDD', 'PRESTATAIRE', 'STAGE', 'STAGIAIRE']).optional(),
  systemRole: z.enum(['DIRECTEUR', 'ENSEIGNANT', 'COMPTABLE']).optional(),
});

export const PayrollGenerateSchema = z.object({
  schoolId: z.string().uuid(),
  month: z.number().min(1).max(12),
  year: z.number().min(2023),
});
