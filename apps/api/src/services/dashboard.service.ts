import { prisma } from '@school-mgmt/shared';
import { CacheService } from '../shared/utils/cache.service';

export class DashboardService {
  static async getStats(tenantId: string) {
    const cacheKey = `dashboard:stats:${tenantId}`;

    return CacheService.getOrSet(cacheKey, async () => {
      // 1. Comptages de base
      const [studentCount, staffCount, paymentStats] = await Promise.all([
        prisma.student.count({
          where: { school: { tenantId } }
        }),
        prisma.staff.count({
          where: { school: { tenantId } }
        }),
        prisma.payment.aggregate({
          where: { 
            enrollment: { student: { school: { tenantId } } }, 
            status: 'COMPLETED' 
          },
          _sum: { amount: true },
          _count: { id: true }
        })
      ]);

      // 2. Calcul du taux de recouvrement
      const totalExpected = await prisma.enrollment.aggregate({
        where: { student: { school: { tenantId } } },
        _sum: { feesTotal: true }
      });

      const recoveryRate = totalExpected._sum.feesTotal 
        ? (Number(paymentStats._sum.amount || 0) / Number(totalExpected._sum.feesTotal)) * 100 
        : 0;

      // 3. Données réelles pour le graphique (6 derniers mois)
      // Note: GroupBy par date exacte est complexe en SQL/Prisma sans raw query
      // Pour une version "chef-d'œuvre", on va simuler un peu mieux ou faire du post-processing
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const enrollments = await prisma.enrollment.findMany({
        where: {
          student: { school: { tenantId } },
          createdAt: { gte: sixMonthsAgo }
        },
        select: { createdAt: true }
      });

      // Post-processing des mois
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
      const chartDataMap: Record<string, number> = {};
      
      // Initialiser les 6 derniers mois
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        chartDataMap[months[d.getMonth()]] = 0;
      }

      enrollments.forEach((e: { createdAt: Date }) => {
        const monthName = months[e.createdAt.getMonth()];
        if (chartDataMap[monthName] !== undefined) {
          chartDataMap[monthName]++;
        }
      });

      const chartData = Object.entries(chartDataMap).map(([n, v]: [string, number]) => ({ n, v }));

      return {
        students: studentCount,
        staff: staffCount,
        recoveryRate: Math.round(recoveryRate),
        totalPayments: Number(paymentStats._sum.amount || 0),
        transactionCount: paymentStats._count.id,
        chartData
      };
    }, 300); // 5 minutes cache
  }
}
