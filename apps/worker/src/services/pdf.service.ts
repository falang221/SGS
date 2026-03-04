import puppeteer from 'puppeteer';
import { reportTemplate } from '../templates/report.template';
import pino from 'pino';

const logger = pino();

export class PDFService {
  
  static async generateReport(data: any): Promise<Buffer> {
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      const html = reportTemplate(data);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });

      return Buffer.from(pdf);
    } catch (error) {
      logger.error('Erreur Puppeteer:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
