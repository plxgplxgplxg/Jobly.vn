import { Router } from 'express';
import SavedJobController from '../controllers/SavedJobController';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/toggle', SavedJobController.toggle.bind(SavedJobController));
router.get('/', SavedJobController.list.bind(SavedJobController));
router.get('/:jobId/status', SavedJobController.checkStatus.bind(SavedJobController));

export default router;
