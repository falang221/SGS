"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const logger_1 = require("../../shared/utils/logger");
const student_dto_1 = require("./student.dto");
const student_service_1 = require("../../services/student.service");
class StudentController {
    static async uploadPhoto(req, res) {
        if (!req.file) {
            return res.status(400).json({ error: 'Photo requise' });
        }
        const { studentId } = req.params;
        try {
            const path = await student_service_1.StudentService.uploadPhoto(studentId, req.file.buffer, req.file.mimetype);
            return res.json({ message: 'Photo uploadée avec succès', path });
        }
        catch (error) {
            const status = error.message === 'Élève non trouvé' ? 404 : 500;
            return res.status(status).json({ error: error.message });
        }
    }
    static async getPhotoUrl(req, res) {
        const { studentId } = req.params;
        try {
            const url = await student_service_1.StudentService.getPhotoUrl(studentId);
            return res.json({ url });
        }
        catch (error) {
            const status = error.message === 'Élève non trouvé' ? 404 : 500;
            return res.status(status).json({ error: error.message });
        }
    }
    static async create(req, res) {
        try {
            const data = student_dto_1.StudentCreateSchema.parse(req.body);
            const student = await student_service_1.StudentService.createStudent(data);
            return res.status(201).json(student);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    static async importCSV(req, res) {
        if (!req.file) {
            return res.status(400).json({ error: 'Fichier CSV requis' });
        }
        const schoolId = req.body.schoolId;
        if (!schoolId) {
            return res.status(400).json({ error: 'School ID requis' });
        }
        try {
            const result = await student_service_1.StudentService.importFromCSV(schoolId, req.file.buffer);
            logger_1.logger.info(`Import réussi : ${result} élèves traités pour l'école ${schoolId}`);
            return res.json({ message: `${result} élèves importés ou mis à jour avec succès.` });
        }
        catch (error) {
            logger_1.logger.error('Erreur Import CSV:', error);
            return res.status(400).json({ error: 'Format CSV invalide ou données corrompues' });
        }
    }
    static async listBySchool(req, res) {
        const { schoolId } = req.params;
        try {
            const students = await student_service_1.StudentService.listStudents(schoolId);
            return res.json(students);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des élèves' });
        }
    }
    static async enroll(req, res) {
        try {
            const data = student_dto_1.EnrollmentCreateSchema.parse(req.body);
            const enrollment = await student_service_1.StudentService.enrollStudent(data);
            return res.status(201).json(enrollment);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}
exports.StudentController = StudentController;
