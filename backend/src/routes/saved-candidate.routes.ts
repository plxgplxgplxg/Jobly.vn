import { Router } from 'express';
import SavedCandidateController from '../controllers/SavedCandidateController';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/toggle', SavedCandidateController.toggle.bind(SavedCandidateController));
router.get('/', SavedCandidateController.list.bind(SavedCandidateController));
router.get('/status/:candidateId', SavedCandidateController.checkStatus.bind(SavedCandidateController));

export default router;
