"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRController = void 0;
const hr_dto_1 = require("./hr.dto");
const hr_service_1 = require("../../services/hr.service");
const errors_1 = require("../../shared/utils/errors");
const audit_service_1 = require("../../shared/utils/audit.service");
class HRController {
    static async createStaff(req, res) {
        try {
            if (!req.user)
                throw new errors_1.UnauthorizedError();
            const data = hr_dto_1.StaffCreateSchema.parse(req.body);
            const result = await hr_service_1.HRService.createStaff(data, req.user.tenantId);
            await audit_service_1.AuditService.log({
                userId: req.user.id,
                action: 'STAFF_CREATE',
                resource: 'STAFF',
                newValue: { staffId: result.id, email: data.email, role: data.role },
                ipAddress: req.ip || '0.0.0.0'
            });
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    static async listBySchool(req, res) {
        const { schoolId } = req.params;
        try {
            const staffList = await hr_service_1.HRService.listStaff(schoolId);
            return res.json(staffList);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la récupération du personnel' });
        }
    }
    static async getStats(req, res) {
        const { schoolId } = req.params;
        try {
            const stats = await hr_service_1.HRService.getHRStats(schoolId);
            return res.json(stats);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors du calcul des statistiques RH' });
        }
    }
    static async generatePayroll(req, res) {
        try {
            const data = hr_dto_1.PayrollGenerateSchema.parse(req.body);
            const result = await hr_service_1.HRService.generatePayrollRecord(data);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}
exports.HRController = HRController;
