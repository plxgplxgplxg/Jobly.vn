import express from 'express';
import MessageController from '../controllers/MessageController';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = express.Router();

// Tất cả routes yêu cầu authentication
router.use(authenticateJWT);

router.get('/conversations', MessageController.listConversations);
router.post('/conversations', MessageController.createConversation);
router.get('/conversations/:otherUserId', MessageController.getConversation);
router.get('/conversations/:conversationId/messages', MessageController.getMessages);
router.post('/conversations/:conversationId/mark-read', MessageController.markAsRead);
router.post('/', MessageController.sendMessage);

export default router;
