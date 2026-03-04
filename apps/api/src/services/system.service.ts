import { prisma } from '@school-mgmt/shared';

export class SystemService {
  static async getSettings() {
    return prisma.systemSetting.findMany();
  }

  static async updateSetting(key: string, value: any, description?: string) {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description }
    });
  }

  static async getStatus() {
    // Simulation de santé système
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    return {
      database: 'CONNECTED',
      dbLatency: `${dbLatency}ms`,
      redis: 'CONNECTED',
      uptime: process.uptime(),
      version: '2.0.0-gold'
    };
  }
}
