import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantName: z.string().min(3),
  role: z.enum(['SUPER_ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'COMPTABLE', 'PARENT', 'STUDENT']),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
