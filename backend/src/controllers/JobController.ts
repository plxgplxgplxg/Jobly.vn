import { Request, Response } from 'express';
import JobService from '../services/JobService';
import { CreateJobDTO, UpdateJobDTO, SearchJobDTO, JobFilterDTO } from '../types/job.types';

class JobController {
  async createJob(req: Request, res: Response): Promise<void> {
    try {
      const employerId = (req as any).user.userId;
      const data: CreateJobDTO = req.body;

      const job = await JobService.createJob(employerId, data);
      res.status(201).json(job);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateJob(req: Request, res: Response): Promise<void> {
    try {
      const employerId = (req as any).user.userId;
      const jobId = req.params.jobId as string;
      const data: UpdateJobDTO = req.body;

      const job = await JobService.updateJob(jobId, employerId, data);
      res.json(job);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const employerId = (req as any).user.userId;
      const jobId = req.params.jobId as string;

      await JobService.deleteJob(jobId, employerId);
      res.json({ message: 'Đã xóa tin tuyển dụng' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getJob(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;

      const job = await JobService.getJob(jobId);
      res.json(job);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async listJobs(req: Request, res: Response): Promise<void> {
    try {
      const filters: JobFilterDTO = {
        companyId: req.query.companyId as string,
        status: req.query.status as any,
        vipFlag: req.query.vipFlag === 'true' ? true : req.query.vipFlag === 'false' ? false : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await JobService.listJobs(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchJobs(req: Request, res: Response): Promise<void> {
    try {
      const query: SearchJobDTO = {
        keyword: req.query.keyword as string,
        industry: req.query.industry as string,
        location: req.query.location as string,
        salaryMin: req.query.salaryMin ? parseInt(req.query.salaryMin as string) : undefined,
        salaryMax: req.query.salaryMax ? parseInt(req.query.salaryMax as string) : undefined,
        vipOnly: req.query.vipOnly === 'true',
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await JobService.searchJobs(query);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listMyJobs(req: Request, res: Response): Promise<void> {
    try {
      const employerId = (req as any).user.userId;
      
      const filters: JobFilterDTO = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await JobService.listEmployerJobs(employerId, filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new JobController();
