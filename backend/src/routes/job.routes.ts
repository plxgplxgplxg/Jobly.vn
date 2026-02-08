import { Router } from 'express';
import JobController from '../controllers/JobController';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes - specific routes TRƯỚC dynamic routes
router.get('/search', JobController.searchJobs.bind(JobController));
router.get('/', JobController.listJobs.bind(JobController));

// Employer only routes - specific routes TRƯỚC dynamic routes
router.get('/my-jobs', authenticateJWT, requireRole('employer'), JobController.listMyJobs.bind(JobController));
router.post('/', authenticateJWT, requireRole('employer'), JobController.createJob.bind(JobController));
router.put('/:jobId', authenticateJWT, requireRole('employer'), JobController.updateJob.bind(JobController));
router.delete('/:jobId', authenticateJWT, requireRole('employer'), JobController.deleteJob.bind(JobController));

// Dynamic routes SAU cùng
router.get('/:jobId', JobController.getJob.bind(JobController));

export default router;
