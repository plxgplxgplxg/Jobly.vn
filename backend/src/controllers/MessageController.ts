import { Request, Response } from 'express';
import MessageService from '../services/MessageService';
import { AuthRequest } from '../middleware/auth.middleware';

class MessageController {
    async listConversations(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;
            const conversations = await MessageService.listConversations(userId);
            res.json(conversations);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getConversation(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;
            const { otherUserId } = req.params;
            const conversation = await MessageService.getConversation(userId, otherUserId as string);

            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            res.json(conversation);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMessages(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;
            const { conversationId } = req.params;
            const limit = parseInt(req.query.limit as string) || 50;

            const messages = await MessageService.getMessages(conversationId as string, userId, limit);
            res.json(messages);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAsRead(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;
            const { conversationId } = req.params;

            await MessageService.markAsRead(conversationId as string, userId);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async sendMessage(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;
            const message = await MessageService.sendMessage(userId, req.body);
            res.json(message);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createConversation(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;
            const { participantId } = req.body;

            if (!participantId) {
                return res.status(400).json({ error: 'Participant ID is required' });
            }

            const conversation = await MessageService.createConversation(userId, participantId);
            res.status(201).json(conversation);
        } catch (error: any) {
            console.error('Create conversation error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new MessageController();
