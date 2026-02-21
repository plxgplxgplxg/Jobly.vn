import { Request, Response } from 'express';
import SavedJobService from '../services/SavedJobService';

class SavedJobController {
    async toggle(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.userId;
            const { jobId } = req.body;
            const result = await SavedJobService.toggle(userId, jobId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 9;
            const result = await SavedJobService.list(userId, page, limit);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async checkStatus(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.userId;
            const { jobId } = req.params;
            const result = await SavedJobService.checkStatus(userId, jobId as string);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new SavedJobController();
