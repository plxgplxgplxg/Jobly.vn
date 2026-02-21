import { Request, Response } from 'express';
import SavedCandidateService from '../services/SavedCandidateService';

class SavedCandidateController {
    async toggle(req: Request, res: Response): Promise<void> {
        try {
            const employerId = (req as any).user.userId;
            const { candidateId } = req.body;

            if (!candidateId) {
                res.status(400).json({ error: 'Candidate ID is required' });
                return;
            }

            const result = await SavedCandidateService.toggle(employerId, candidateId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const employerId = (req as any).user.userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 9;
            const result = await SavedCandidateService.list(employerId, page, limit);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async checkStatus(req: Request, res: Response): Promise<void> {
        try {
            const employerId = (req as any).user.userId;
            const { candidateId } = req.params;
            const result = await SavedCandidateService.checkStatus(employerId, candidateId as string);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new SavedCandidateController();
