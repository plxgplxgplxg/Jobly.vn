import { Router } from 'express';
import ApplicationController from '../controllers/ApplicationController';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Candidate routes
router.post('/', authenticateJWT, requireRole('candidate'), ApplicationController.createApplication.bind(ApplicationController));
router.put('/:applicationId', authenticateJWT, requireRole('candidate'), ApplicationController.updateApplication.bind(ApplicationController));
router.post('/:applicationId/withdraw', authenticateJWT, requireRole('candidate'), ApplicationController.withdrawApplication.bind(ApplicationController));
router.get('/my-applications', authenticateJWT, requireRole('candidate'), ApplicationController.listMyApplications.bind(ApplicationController));

// Shared routes (cần auth)
router.get('/:applicationId', authenticateJWT, ApplicationController.getApplication.bind(ApplicationController));

// Employer routes
router.get('/jobs/:jobId/applications', authenticateJWT, requireRole('employer'), ApplicationController.listJobApplications.bind(ApplicationController));
router.put('/:applicationId/status', authenticateJWT, requireRole('employer'), ApplicationController.updateApplicationStatus.bind(ApplicationController));

export default router;
