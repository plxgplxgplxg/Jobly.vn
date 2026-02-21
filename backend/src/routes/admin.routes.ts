import { Router } from 'express';
import AdminController from '../controllers/AdminController';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Tất cả route admin đều cần đăng nhập và role admin
router.use(authenticateJWT);
router.use(requireAdmin);

// Quản lý người dùng
router.get('/users', AdminController.listUsers);
router.post('/users/:userId/lock', AdminController.lockUser);
router.post('/users/:userId/unlock', AdminController.unlockUser);
router.post('/users/:userId/reject', AdminController.rejectUser);
router.post('/users/:userId/warning', AdminController.sendWarning);
router.delete('/users/:userId', AdminController.deleteUser);

// Duyệt tin tuyển dụng
router.get('/jobs/pending', AdminController.listPendingJobs);
router.post('/jobs/:jobId/approve', AdminController.approveJob);
router.post('/jobs/:jobId/reject', AdminController.rejectJob);

// Quản lý CV Templates
router.post('/cv-templates', AdminController.createTemplate);
router.put('/cv-templates/:templateId', AdminController.updateTemplate);
router.delete('/cv-templates/:templateId', AdminController.deleteTemplate);
router.get('/cv-templates', AdminController.listTemplates);

// Báo cáo thống kê
router.get('/statistics', AdminController.getStatistics);
router.get('/reports/export', AdminController.exportReport);

export default router;
