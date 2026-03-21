import { prisma, Staff, Role } from '@school-mgmt/shared';
import bcrypt from 'bcryptjs';
import { logger } from '../shared/utils/logger';

export interface StaffUpdateInput {
  role?: string;
  salary?: number;
  contractType?: string;
  systemRole?: Role;
  firstName?: string;
  lastName?: string;
}

export class HRService {
  /**
   * Création d'un collaborateur avec compte utilisateur lié
   */
  static async createStaff(data: any, tenantId: string) {
    const defaultPassword = await bcrypt.hash('SGS12345!', 12);

    const school = await prisma.school.findFirst({
      where: {
        id: data.schoolId,
        tenantId,
      },
      select: { id: true },
    });

    if (!school) {
      throw new Error('École introuvable pour ce tenant');
    }
    
    return prisma.$transaction(async (tx: any) => {
      const existingUser = await tx.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // 1. Créer l'utilisateur système
      const user = await tx.user.create({
        data: {
          email: data.email.trim().toLowerCase(),
          password: defaultPassword,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          role: data.systemRole || 'ENSEIGNANT',
          tenantId: tenantId
        }
      });

      // 2. Créer le profil RH
      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          schoolId: data.schoolId,
          role: data.role,
          salary: data.salary,
          contractType: data.contractType || 'CDI'
        },
        include: { user: true }
      });

      return staff;
    });
  }

  /**
   * Mise à jour du profil collaborateur
   */
  static async updateStaff(id: string, data: StaffUpdateInput, tenantId: string) {
    return prisma.$transaction(async (tx: any) => {
      const staff = await tx.staff.findFirst({
        where: {
          id,
          school: { tenantId },
        },
      });
      if (!staff) throw new Error('Collaborateur non trouvé');

      // Mise à jour du rôle système si nécessaire
      const userData: Record<string, unknown> = {};
      if (data.systemRole) userData.role = data.systemRole;
      if (typeof data.firstName === 'string') userData.firstName = data.firstName;
      if (typeof data.lastName === 'string') userData.lastName = data.lastName;

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: staff.userId },
          data: userData,
        });
      }

      // Mise à jour du profil RH
      return tx.staff.update({
        where: { id },
        data: {
          role: data.role,
          salary: data.salary,
          contractType: data.contractType
        },
        include: { user: true }
      });
    });
  }

  static async deleteStaff(id: string, tenantId: string) {
    const staff = await prisma.staff.findFirst({
      where: {
        id,
        school: { tenantId },
      },
      select: { id: true },
    });

    if (!staff) throw new Error('Collaborateur non trouvé');

    await prisma.staff.delete({ where: { id: staff.id } });
  }

  static async listStaff(schoolId: string, tenantId: string) {
    return prisma.staff.findMany({
      where: {
        schoolId,
        school: { tenantId },
      },
      include: { 
        user: { 
          select: { 
            email: true, 
            firstName: true,
            lastName: true,
            createdAt: true,
            role: true
          } 
        } 
      },
      orderBy: { role: 'asc' }
    });
  }

  /**
   * Statistiques RH détaillées
   */
  static async getHRStats(schoolId: string, tenantId: string) {
    const staffList = await prisma.staff.findMany({
      where: {
        schoolId,
        school: { tenantId },
      },
      select: { 
        salary: true,
        role: true,
        contractType: true
      }
    });

    const totalSalary = staffList.reduce((acc: number, s: any) => acc + Number(s.salary || 0), 0);
    
    // Répartition par rôle
    const rolesDistribution = staffList.reduce((acc: any, s: any) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {});

    return {
      count: staffList.length,
      monthlyPayroll: totalSalary,
      avgSalary: staffList.length > 0 ? totalSalary / staffList.length : 0,
      rolesDistribution: Object.entries(rolesDistribution).map(([name, value]) => ({ name, value })),
      contractTypes: {
        CDI: staffList.filter((s: any) => s.contractType === 'CDI').length,
        CDD: staffList.filter((s: any) => s.contractType === 'CDD').length,
        PRESTATAIRE: staffList.filter((s: any) => s.contractType === 'PRESTATAIRE').length,
      }
    };
  }

  /**
   * Simulation de génération de registre de paie
   */
  static async generatePayrollRecord(data: any, tenantId: string) {
    const staffList = await prisma.staff.findMany({
      where: {
        schoolId: data.schoolId,
        school: { tenantId },
      },
      include: { user: true }
    });

    const payrollEntries = staffList.map((s: any) => ({
      staffId: s.id,
      name: s.user?.email ? s.user.email.split('@')[0] : `staff-${s.id}`,
      baseSalary: Number(s.salary || 0),
      bonus: 0,
      deductions: 0,
      netAmount: Number(s.salary || 0)
    }));

    const totalAmount = payrollEntries.reduce((acc: number, curr: any) => acc + curr.netAmount, 0);

    logger.info(`[HR] Registre de paie généré pour ${data.month}/${data.year} (Total: ${totalAmount})`);

    return {
      month: data.month,
      year: data.year,
      processedAt: new Date(),
      staffCount: staffList.length,
      totalProcessed: staffList.length,
      totalAmount,
      entries: payrollEntries
    };
  }
}
