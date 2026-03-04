import { prisma } from '@school-mgmt/shared';

export class RankingService {
  /**
   * Calcule le rang d'un élève dans sa classe pour une période donnée.
   * @returns { rank: number, total: number, classAverage: number }
   */
  static async calculateRank(classId: string, yearId: string, period: string, targetStudentId: string) {
    // 1. Récupérer tous les élèves inscrits dans cette classe pour cette année
    const enrollments = await prisma.enrollment.findMany({
      where: {
        classId,
        yearId,
        status: 'ACTIVE'
      },
      include: {
        grades: {
          where: { period }
        }
      }
    });

    if (enrollments.length === 0) {
      return { rank: 0, total: 0, classAverage: 0 };
    }

    // 2. Calculer la moyenne de chaque élève
    const studentsWithAverages = enrollments.map((enrollment: any) => {
      const totalPoints = enrollment.grades.reduce((acc: number, g: any) => acc + (Number(g.value) * g.coeff), 0);
      const totalCoeffs = enrollment.grades.reduce((acc: number, g: any) => acc + g.coeff, 0);
      
      const average = totalCoeffs > 0 ? totalPoints / totalCoeffs : 0;
      
      return {
        studentId: enrollment.studentId,
        average
      };
    });

    // 3. Trier par moyenne décroissante
    studentsWithAverages.sort((a: any, b: any) => b.average - a.average);

    // 4. Trouver le rang de l'élève cible
    const rankIndex = studentsWithAverages.findIndex((s: any) => s.studentId === targetStudentId);
    const rank = rankIndex !== -1 ? rankIndex + 1 : 0;

    // 5. Calculer la moyenne de la classe
    const classAverageTotal = studentsWithAverages.reduce((acc: number, s: any) => acc + s.average, 0);
    const classAverage = classAverageTotal / enrollments.length;

    return {
      rank,
      total: enrollments.length,
      classAverage: parseFloat(classAverage.toFixed(2)),
      averages: studentsWithAverages // Optionnel, pour plus de détails
    };
  }

  /**
   * Formate le rang en chaîne lisible (ex: 1er, 2ème)
   */
  static formatRank(rank: number): string {
    if (rank === 1) return '1er';
    return `${rank}ème`;
  }
}
