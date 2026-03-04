import { Request, Response } from 'express';
import { SystemService } from '../../services/system.service';

export class SystemController {
  static async getSettings(req: Request, res: Response) {
    try {
      const settings = await SystemService.getSettings();
      return res.json(settings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateSetting(req: Request, res: Response) {
    try {
      const { key, value, description } = req.body;
      const setting = await SystemService.updateSetting(key, value, description);
      return res.json(setting);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getStatus(req: Request, res: Response) {
    try {
      const status = await SystemService.getStatus();
      return res.json(status);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
