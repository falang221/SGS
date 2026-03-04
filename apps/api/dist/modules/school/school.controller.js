"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolController = void 0;
const school_service_1 = require("../../services/school.service");
class SchoolController {
    static async getProfile(req, res) {
        const { schoolId } = req.params;
        try {
            const school = await school_service_1.SchoolService.getById(schoolId);
            return res.json(school);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async updateConfig(req, res) {
        const { schoolId } = req.params;
        try {
            const school = await school_service_1.SchoolService.updateConfig(schoolId, req.body);
            return res.json(school);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    static async getYears(req, res) {
        const { schoolId } = req.params;
        try {
            const years = await school_service_1.SchoolService.listYears(schoolId);
            return res.json(years);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.SchoolController = SchoolController;
