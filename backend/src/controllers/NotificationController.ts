import { Request, Response } from 'express';
import NotificationService from '../services/NotificationService';

class NotificationController {
    async list(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.userId;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            const result = await NotificationService.listByUser(userId, limit, offset);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;
            await NotificationService.markAsRead(id as string, userId);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAllAsRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.userId;
            await NotificationService.markAllAsRead(userId);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new NotificationController();
