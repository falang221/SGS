import { prisma, prismaStorage } from '@school-mgmt/shared';
import { PDFService } from './services/pdf.service';
import { RankingService } from './services/ranking.service';
import { StorageService } from './shared/utils/storage.service';

export type ReportJobData = {
  tenantId: string;
  schoolId: string;
  studentId: string;
  period: string;
  year: string;
};

async function runReportJob(data: ReportJobData) {
  const { schoolId, studentId, period, year } = data;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      school: true,
      enrollments: {
        where: { yearId: year },
        include: { class: true },
      },
    },
  });

  if (!student || student.schoolId !== schoolId || student.enrollments.length === 0) {
    throw new Error('Élève ou inscription non trouvée');
  }

  const currentEnrollment = student.enrollments[0];
  const classId = currentEnrollment.classId;

  const rankingData = await RankingService.calculateRank(classId, year, period, studentId);

  const grades = await prisma.grade.findMany({
    where: {
      enrollment: { studentId, yearId: year },
      period,
    },
  });

  const totalPoints = grades.reduce((acc: number, g: any) => acc + Number(g.value) * g.coeff, 0);
  const totalCoeffs = grades.reduce((acc: number, g: any) => acc + g.coeff, 0);
  const average = totalCoeffs > 0 ? totalPoints / totalCoeffs : 0;

  const pdfBuffer = await PDFService.generateReport({
    schoolName: student.school.name,
    studentName: `${student.firstName} ${student.lastName}`,
    className: currentEnrollment.class?.name || 'N/A',
    matricule: student.matricule,
    birthDate: student.birthDate.toLocaleDateString('fr-FR'),
    period,
    year,
    grades,
    average: average.toFixed(2),
    rank: `${RankingService.formatRank(rankingData.rank)}/${rankingData.total}`,
    classAverage: rankingData.classAverage.toString(),
  });

  const storagePath = `bulletins/${year}/${period}/${studentId}.pdf`;
  await StorageService.upload(storagePath, pdfBuffer, 'application/pdf');

  return { status: 'SUCCESS', path: storagePath, rank: rankingData.rank };
}

export async function processReportJob(data: ReportJobData) {
  return prismaStorage.run(
    {
      tenantId: data.tenantId,
    },
    () => runReportJob(data),
  );
}
