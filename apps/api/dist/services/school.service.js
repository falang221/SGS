"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolService = void 0;
const shared_1 = require("@school-mgmt/shared");
class SchoolService {
    static async getById(schoolId) {
        return shared_1.prisma.school.findUnique({
            where: { id: schoolId },
            include: { tenant: true }
        });
    }
    static async updateConfig(schoolId, data) {
        return shared_1.prisma.school.update({
            where: { id: schoolId },
            data: {
                name: data.name,
                address: data.address,
                config: data.config // JSON field
            }
        });
    }
    static async listYears(schoolId) {
        // Dans une version réelle, on aurait une table 'SchoolYear'
        // Pour l'instant, on simule via la config ou on renvoie une liste par défaut
        return [
            { id: '2023-2024', name: '2023-2024', status: 'ARCHIVED' },
            { id: '2024-2025', name: '2024-2025', status: 'ACTIVE' },
            { id: '2025-2026', name: '2025-2026', status: 'DRAFT' },
        ];
    }
}
exports.SchoolService = SchoolService;
