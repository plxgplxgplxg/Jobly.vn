import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import AdminService from '../services/AdminService';
import { UserFilterDTO, TemplateFilterDTO } from '../types/admin.types';

class AdminController {
  // Quản lý người dùng
  async listUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters: UserFilterDTO = {
        role: req.query.role as string,
        status: req.query.status as string,
        keyword: req.query.keyword as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await AdminService.listUsers(filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async lockUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { reason } = req.body;
      const adminId = req.user!.userId;

      const user = await AdminService.lockUser(userId, reason, adminId);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async unlockUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const adminId = req.user!.userId;

      const user = await AdminService.unlockUser(userId, adminId);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async rejectUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { reason } = req.body;
      const adminId = req.user!.userId;

      const user = await AdminService.rejectUser(userId, adminId, reason);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async sendWarning(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { message } = req.body;
      const adminId = req.user!.userId;

      await AdminService.sendWarning(userId, message, adminId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const adminId = req.user!.userId;

      await AdminService.deleteUser(userId, adminId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Duyệt tin tuyển dụng
  async listPendingJobs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await AdminService.listPendingJobs(filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async approveJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      const adminId = req.user!.userId;

      const job = await AdminService.approveJob(jobId, adminId);
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async rejectJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      const { reason } = req.body;
      const adminId = req.user!.userId;

      const job = await AdminService.rejectJob(jobId, adminId, reason);
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Quản lý CV Templates
  async createTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminId = req.user!.userId;
      const template = await AdminService.createTemplate(req.body, adminId);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const templateId = req.params.templateId as string;
      const adminId = req.user!.userId;

      const template = await AdminService.updateTemplate(templateId, req.body, adminId);
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const templateId = req.params.templateId as string;
      const adminId = req.user!.userId;

      await AdminService.deleteTemplate(templateId, adminId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async listTemplates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters: TemplateFilterDTO = {
        category: req.query.category as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await AdminService.listTemplates(filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Báo cáo thống kê
  async getStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      let dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : new Date();
      let dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : new Date();

      if (!req.query.dateFrom) {
        dateFrom.setDate(dateFrom.getDate() - 30);
      }

      const stats = await AdminService.getStatistics(dateFrom, dateTo);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async exportReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const type = req.query.type as 'users' | 'jobs' | 'applications';
      const dateFrom = new Date(req.query.dateFrom as string);
      const dateTo = new Date(req.query.dateTo as string);
      const format = (req.query.format as 'excel' | 'pdf') || 'excel';

      const buffer = await AdminService.exportReport(type, dateFrom, dateTo, format);

      // Set headers
      const filename = `report_${type}_${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      const contentType =
        format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AdminController();
