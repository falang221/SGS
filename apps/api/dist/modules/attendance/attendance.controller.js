"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_dto_1 = require("./attendance.dto");
const attendance_service_1 = require("../../services/attendance.service");
const errors_1 = require("../../shared/utils/errors");
class AttendanceController {
    static async submitBulk(req, res) {
        try {
            if (!req.user)
                throw new errors_1.UnauthorizedError();
            const data = attendance_dto_1.BulkAttendanceSchema.parse(req.body);
            const result = await attendance_service_1.AttendanceService.submitBulk(data, req.user.id, req.user.tenantId);
            return res.status(201).json({
                message: `${result.length} présences enregistrées.`,
                data: result
            });
        }
        catch (error) {
            return res.status(error.statusCode || 400).json({ error: error.message });
        }
    }
    static async getHistoryByEnrollment(req, res) {
        const { enrollmentId } = req.params;
        try {
            const history = await attendance_service_1.AttendanceService.getHistoryByEnrollment(enrollmentId);
            return res.json(history);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des présences' });
        }
    }
    static async getDailyStats(req, res) {
        const { schoolId } = req.params;
        const date = req.query.date ? new Date(req.query.date) : new Date();
        try {
            const stats = await attendance_service_1.AttendanceService.getDailyStats(schoolId, date);
            return res.json(stats);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors du calcul des statistiques de présence' });
        }
    }
}
exports.AttendanceController = AttendanceController;
