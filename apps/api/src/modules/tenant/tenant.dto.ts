import { z } from 'zod';

export const TenantCreateSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  slug: z.string().min(3, 'Le slug doit contenir au moins 3 caractères').regex(/^[a-z0-9-]+$/, 'Slug invalide (minuscules, chiffres et tirets uniquement)'),
  plan: z.enum(['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE']).default('FREE'),
  adminEmail: z.string().email('Email invalide'),
  adminPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export const SchoolCreateSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(3),
  type: z.enum(['PRIMARY', 'SECONDARY', 'HIGH_SCHOOL', 'COMPLEX']),
  address: z.string().optional(),
});
