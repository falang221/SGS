"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const report_template_1 = require("../templates/report.template");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
class PDFService {
    static async generateReport(data) {
        const browser = await puppeteer_1.default.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        try {
            const page = await browser.newPage();
            const html = (0, report_template_1.reportTemplate)(data);
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
            });
            return Buffer.from(pdf);
        }
        catch (error) {
            logger.error('Erreur Puppeteer:', error);
            throw error;
        }
        finally {
            await browser.close();
        }
    }
}
exports.PDFService = PDFService;
