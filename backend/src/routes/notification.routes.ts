import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', NotificationController.list.bind(NotificationController));
router.patch('/:id/read', NotificationController.markAsRead.bind(NotificationController));
router.patch('/read-all', NotificationController.markAllAsRead.bind(NotificationController));

export default router;
