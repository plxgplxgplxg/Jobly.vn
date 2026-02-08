import { Request, Response } from 'express';
import AuthService from '../services/AuthService';

class AuthController {
  // Đăng ký: candidate -> active ngay, employer -> pending chờ duyệt
  async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}

export default new AuthController();
