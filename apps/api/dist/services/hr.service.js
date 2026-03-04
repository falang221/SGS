"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRService = void 0;
const shared_1 = require("@school-mgmt/shared");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class HRService {
    static async createStaff(data, tenantId) {
        const hashedPassword = await bcryptjs_1.default.hash('SGS12345!', 12);
        return shared_1.prisma.$transaction(async (tx) => {
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
    static async listStaff(schoolId) {
        return shared_1.prisma.staff.findMany({
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
    static async getHRStats(schoolId) {
        const staffList = await shared_1.prisma.staff.findMany({
            where: { schoolId },
            select: { salary: true }
        });
        const totalSalary = staffList.reduce((acc, s) => acc + Number(s.salary || 0), 0);
        return {
            count: staffList.length,
            monthlyPayroll: totalSalary,
            retentionRate: 98, // Simulation logic
        };
    }
    static async generatePayrollRecord(data) {
        // Logique métier pour la génération des fiches de paie
        const staffList = await shared_1.prisma.staff.findMany({
            where: { schoolId: data.schoolId }
        });
        return {
            month: data.month,
            year: data.year,
            totalProcessed: staffList.length,
            totalAmount: staffList.reduce((acc, s) => acc + Number(s.salary || 0), 0)
        };
    }
}
exports.HRService = HRService;
