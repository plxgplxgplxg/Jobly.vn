import { Request, Response } from 'express';
import UserService from '../services/UserService';
import { AuthRequest } from '../middleware/auth.middleware';

class UserController {
  // Profile endpoints
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const profile = await UserService.getProfile(userId);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const stats = await UserService.getDashboardStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const profile = await UserService.updateProfile(userId, req.body);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async completeProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const profile = await UserService.completeProfile(userId, req.body);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async uploadAvatar(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      if (!req.file) {
        return res.status(400).json({ error: 'Vui lòng chọn file avatar' });
      }
      const avatarUrl = await UserService.uploadAvatar(userId, req.file);
      res.json({ avatarUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // CV endpoints
  async uploadCV(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      if (!req.file) {
        return res.status(400).json({ error: 'Vui lòng chọn file CV' });
      }
      const cv = await UserService.uploadCV(userId, req.file);
      res.json(cv);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCV(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const cvId = req.params.cvId as string;
      await UserService.deleteCV(userId, cvId);
      res.json({ message: 'Xóa CV thành công' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listCVs(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const cvs = await UserService.listCVs(userId);
      res.json(cvs);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async setDefaultCV(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const cvId = req.params.cvId as string;
      const cv = await UserService.setDefaultCV(userId, cvId);
      res.json(cv);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Company endpoints
  async createCompany(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const company = await UserService.createCompany(userId, req.body);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCompany(req: AuthRequest, res: Response) {
    try {
      const companyId = req.params.companyId as string;
      const company = await UserService.updateCompany(companyId, req.body);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCompany(req: AuthRequest, res: Response) {
    try {
      const companyId = req.params.companyId as string;
      const company = await UserService.getCompany(companyId);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async uploadLogo(req: AuthRequest, res: Response) {
    try {
      const companyId = req.params.companyId as string;
      if (!req.file) {
        return res.status(400).json({ error: 'Vui lòng chọn file logo' });
      }
      const logoUrl = await UserService.uploadLogo(companyId, req.file);
      res.json({ logoUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchCandidates(req: AuthRequest, res: Response) {
    try {
      const query = req.query.q as string || '';
      const candidates = await UserService.searchCandidates(query);
      res.json(candidates);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCandidateProfile(req: AuthRequest, res: Response) {
    try {
      const candidateId = req.params.candidateId as string;
      const profile = await UserService.getProfile(candidateId);
      // Check if candidate role is actual candidate
      if (profile.role !== 'candidate') {
        throw new Error('Người dùng không phải là ứng viên');
      }
      res.json(profile);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}

export default new UserController();
