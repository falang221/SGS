import { prisma, Staff, Role } from '@school-mgmt/shared';
import bcrypt from 'bcryptjs';
import { logger } from '../shared/utils/logger';

export interface StaffUpdateInput {
  role?: string;
  salary?: number;
  contractType?: string;
  systemRole?: Role;
}

export class HRService {
  /**
   * Création d'un collaborateur avec compte utilisateur lié
   */
  static async createStaff(data: any, tenantId: string) {
    const defaultPassword = await bcrypt.hash('SGS12345!', 12);
    
    return prisma.$transaction(async (tx: any) => {
      // 1. Créer l'utilisateur système
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: defaultPassword,
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
  static async updateStaff(id: string, data: StaffUpdateInput) {
    return prisma.$transaction(async (tx: any) => {
      const staff = await tx.staff.findUnique({ where: { id } });
      if (!staff) throw new Error('Collaborateur non trouvé');

      // Mise à jour du rôle système si nécessaire
      if (data.systemRole) {
        await tx.user.update({
          where: { id: staff.userId },
          data: { role: data.systemRole }
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

  static async listStaff(schoolId: string) {
    return prisma.staff.findMany({
      where: { schoolId },
      include: { 
        user: { 
          select: { 
            email: true, 
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
  static async getHRStats(schoolId: string) {
    const staffList = await prisma.staff.findMany({
      where: { schoolId },
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
        CDI: staffList.filter(s => s.contractType === 'CDI').length,
        CDD: staffList.filter(s => s.contractType === 'CDD').length,
        PRESTATAIRE: staffList.filter(s => s.contractType === 'PRESTATAIRE').length,
      }
    };
  }

  /**
   * Simulation de génération de registre de paie
   */
  static async generatePayrollRecord(data: any) {
    const staffList = await prisma.staff.findMany({
      where: { schoolId: data.schoolId },
      include: { user: true }
    });

    const payrollEntries = staffList.map(s => ({
      staffId: s.id,
      name: s.user.email.split('@')[0],
      baseSalary: Number(s.salary || 0),
      bonus: 0,
      deductions: 0,
      netAmount: Number(s.salary || 0)
    }));

    const totalAmount = payrollEntries.reduce((acc, curr) => acc + curr.netAmount, 0);

    logger.info(`[HR] Registre de paie généré pour ${data.month}/${data.year} (Total: ${totalAmount})`);

    return {
      month: data.month,
      year: data.year,
      processedAt: new Date(),
      totalProcessed: staffList.length,
      totalAmount,
      entries: payrollEntries
    };
  }
}
