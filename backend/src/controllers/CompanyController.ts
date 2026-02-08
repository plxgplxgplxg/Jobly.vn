import { Request, Response } from 'express';
import CompanyService from '../services/CompanyService';

class CompanyController {
    async listCompanies(req: Request, res: Response) {
        try {
            const { page, limit, search, industry } = req.query;

            const result = await CompanyService.getCompanies({
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                search: search as string,
                industry: industry as string
            });

            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getCompany(req: Request, res: Response) {
        try {
            const company = await CompanyService.getCompanyById(req.params.id as string);
            res.json(company);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async getCompanyJobs(req: Request, res: Response) {
        try {
            const { page, limit } = req.query;

            const result = await CompanyService.getCompanyJobs(req.params.id as string, {
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined
            });

            res.json(result);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async createCompany(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const company = await CompanyService.createCompany({
                ...req.body,
                userId
            });

            res.status(201).json(company);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateCompany(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            await CompanyService.updateCompany(req.params.id as string, userId, req.body);
            res.json({ message: 'Cập nhật công ty thành công' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteCompany(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            await CompanyService.deleteCompany(req.params.id as string, userId);
            res.json({ message: 'Xóa công ty thành công' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new CompanyController();
