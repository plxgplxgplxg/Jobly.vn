import { Request, Response } from 'express';
import ApplicationService from '../services/ApplicationService';
import { CreateApplicationDTO, UpdateApplicationDTO, ApplicationFilterDTO } from '../types/application.types';
import { ApplicationStatus } from '../models/Application';

class ApplicationController {
  async createApplication(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = (req as any).user.userId;
      const data: CreateApplicationDTO = req.body;

      const application = await ApplicationService.createApplication(candidateId, data);
      res.status(201).json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateApplication(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = (req as any).user.userId;
      const applicationId = req.params.applicationId as string;
      const data: UpdateApplicationDTO = req.body;

      const application = await ApplicationService.updateApplication(applicationId, candidateId, data);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async withdrawApplication(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = (req as any).user.userId;
      const applicationId = req.params.applicationId as string;

      const application = await ApplicationService.withdrawApplication(applicationId, candidateId);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getApplication(req: Request, res: Response): Promise<void> {
    try {
      const applicationId = req.params.applicationId as string;

      const application = await ApplicationService.getApplication(applicationId);
      res.json(application);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async listMyApplications(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = (req as any).user.userId;
      
      const filters: ApplicationFilterDTO = {
        status: req.query.status as ApplicationStatus,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await ApplicationService.listCandidateApplications(candidateId, filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listJobApplications(req: Request, res: Response): Promise<void> {
    try {
      const employerId = (req as any).user.userId;
      const jobId = req.params.jobId as string;
      
      const filters: ApplicationFilterDTO = {
        status: req.query.status as ApplicationStatus,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await ApplicationService.listJobApplications(jobId, employerId, filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateApplicationStatus(req: Request, res: Response): Promise<void> {
    try {
      const employerId = (req as any).user.userId;
      const applicationId = req.params.applicationId as string;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ error: 'Status là bắt buộc' });
        return;
      }

      const application = await ApplicationService.updateApplicationStatus(applicationId, employerId, status);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new ApplicationController();
