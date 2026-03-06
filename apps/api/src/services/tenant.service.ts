import { prisma } from '@school-mgmt/shared';
import bcrypt from 'bcryptjs';
import { logger } from '../shared/utils/logger';

export class TenantService {
  /**
   * Création d'un nouveau Tenant avec son école par défaut et son directeur
   */
  static async createTenant(data: any) {
    const hashedPassword = await bcrypt.hash(data.adminPassword, 12);

    return prisma.$transaction(async (tx: any) => {
      // 1. Créer le Tenant (Le groupe)
      const tenant = await tx.tenant.create({
        data: {
          name: data.name,
          slug: data.slug,
          plan: data.plan || 'FREE',
        },
      });

      // 2. Créer l'école par défaut pour ce tenant
      const school = await tx.school.create({
        data: {
          tenantId: tenant.id,
          name: `${data.name} - Campus Principal`,
          type: 'COMPLEX',
          address: 'À renseigner',
        }
      });

      // 3. Créer le premier administrateur (Directeur) lié à cette école
      const admin = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.adminEmail,
          password: hashedPassword,
          role: 'DIRECTEUR',
          // On pourra ajouter un lien staffProfile plus tard si nécessaire
        },
      });

      // Note: On pourrait aussi créer un profil Staff par défaut pour le directeur ici
      
      logger.info(`[Tenant] Nouveau groupe créé avec son école: ${tenant.name}`);
      return { tenant, school, admin };
    });
  }

  static async listAllTenants() {
    return prisma.tenant.findMany({
      include: {
        _count: {
          select: { schools: true, users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async addSchoolToTenant(data: any) {
    const school = await prisma.school.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        type: data.type,
        address: data.address
      }
    });
    return school;
  }
}
