"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicController = void 0;
const academic_dto_1 = require("./academic.dto");
const academic_service_1 = require("../../services/academic.service");
class AcademicController {
    static async createSubject(req, res) {
        try {
            const data = academic_dto_1.SubjectCreateSchema.parse(req.body);
            const subject = await academic_service_1.AcademicService.createSubject(data);
            return res.status(201).json(subject);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    static async listSubjects(req, res) {
        const { schoolId } = req.params;
        try {
            const subjects = await academic_service_1.AcademicService.listSubjects(schoolId);
            return res.json(subjects);
        }
        catch (error) {
            return res.status(500).json({ error: "Erreur lors de la récupération des matières" });
        }
    }
    static async createTimetableEntry(req, res) {
        try {
            const data = academic_dto_1.TimetableCreateSchema.parse(req.body);
            const entry = await academic_service_1.AcademicService.createTimetableEntry(data);
            return res.status(201).json(entry);
        }
        catch (error) {
            const status = error.statusCode || 400;
            return res.status(status).json({ error: error.message });
        }
    }
    static async getTimetableByClass(req, res) {
        const { classId } = req.params;
        try {
            const timetable = await academic_service_1.AcademicService.getTimetableByClass(classId);
            return res.json(timetable);
        }
        catch (error) {
            return res.status(500).json({ error: "Erreur lors de la récupération de l'emploi du temps" });
        }
    }
    static async listClasses(req, res) {
        const { schoolId } = req.params;
        try {
            const classes = await academic_service_1.AcademicService.listClasses(schoolId);
            return res.json(classes);
        }
        catch (error) {
            return res.status(500).json({ error: "Erreur lors de la récupération des classes" });
        }
    }
}
exports.AcademicController = AcademicController;
