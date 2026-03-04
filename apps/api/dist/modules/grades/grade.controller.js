"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeController = void 0;
const grade_dto_1 = require("./grade.dto");
const grade_service_1 = require("../../services/grade.service");
const errors_1 = require("../../shared/utils/errors");
const audit_service_1 = require("../../shared/utils/audit.service");
class GradeController {
    static async submit(req, res) {
        try {
            if (!req.user)
                throw new errors_1.UnauthorizedError();
            const data = grade_dto_1.GradeCreateSchema.parse(req.body);
            const grade = await grade_service_1.GradeService.submitGrade(data, req.user.tenantId);
            // Audit Log: Saisie de note
            await audit_service_1.AuditService.log({
                userId: req.user.id,
                action: 'GRADE_SUBMIT',
                resource: 'GRADE',
                newValue: { enrollmentId: data.enrollmentId, subjectId: data.subjectId, value: data.value },
                ipAddress: req.ip || '0.0.0.0'
            });
            return res.status(201).json(grade);
        }
        catch (error) {
            return res.status(error.statusCode || 400).json({ error: error.message });
        }
    }
    static async listByEnrollment(req, res) {
        const { enrollmentId } = req.params;
        try {
            const grades = await grade_service_1.GradeService.listByEnrollment(enrollmentId);
            return res.json(grades);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
        }
    }
    static async generateReports(req, res) {
        try {
            const data = grade_dto_1.ReportGenerateSchema.parse(req.body);
            await grade_service_1.GradeService.launchReportGeneration(data);
            return res.json({
                message: 'La génération des bulletins a été lancée en arrière-plan.',
                status: 'PENDING'
            });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    static async listByClassAndSubject(req, res) {
        const { classId, subjectId } = req.params;
        const period = req.query.period || 'Trimestre 1';
        try {
            const grades = await grade_service_1.GradeService.listByClassAndSubject(classId, subjectId, period);
            return res.json(grades);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
        }
    }
}
exports.GradeController = GradeController;
