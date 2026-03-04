import { prisma, Staff } from '@school-mgmt/shared';
import bcrypt from 'bcryptjs';

export class HRService {
  static async createStaff(data: any, tenantId: string) {
    const hashedPassword = await bcrypt.hash('SGS12345!', 12);
    
    return prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: data.systemRole || 'ENSEIGNANT',
          tenantId: tenantId
        }
      });

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          schoolId: data.schoolId,
          role: data.role,
          salary: data.salary,
          contractType: data.contractType
        }
      });

      return staff;
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
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getHRStats(schoolId: string) {
    const staffList = await prisma.staff.findMany({
      where: { schoolId },
      select: { salary: true }
    });

    const totalSalary = staffList.reduce((acc: number, s: any) => acc + Number(s.salary || 0), 0);

    return {
      count: staffList.length,
      monthlyPayroll: totalSalary,
      retentionRate: 98, // Simulation logic
    };
  }

  static async generatePayrollRecord(data: any) {
    // Logique métier pour la génération des fiches de paie
    const staffList = await prisma.staff.findMany({
      where: { schoolId: data.schoolId }
    });

    return {
      month: data.month,
      year: data.year,
      totalProcessed: staffList.length,
      totalAmount: staffList.reduce((acc: number, s: Staff) => acc + Number(s.salary || 0), 0)
    };
  }
}
