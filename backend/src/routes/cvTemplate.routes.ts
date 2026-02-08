import express from 'express';
import CVTemplateController from '../controllers/CVTemplateController';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = express.Router();

// Template routes (public)
router.get('/cv-templates', CVTemplateController.listTemplates);
router.get('/cv-templates/:id', CVTemplateController.getTemplate);
router.get('/cv-templates/:id/preview', CVTemplateController.previewTemplate);
router.post('/cv-templates/:id/generate', CVTemplateController.generatePDF);

// User CV routes (protected)
router.post('/user-cvs', authenticateJWT, CVTemplateController.createUserCV);
router.put('/user-cvs/:id', authenticateJWT, CVTemplateController.updateUserCV);
router.delete('/user-cvs/:id', authenticateJWT, CVTemplateController.deleteUserCV);
router.get('/user-cvs', authenticateJWT, CVTemplateController.listUserCVs);
router.get('/user-cvs/:id', authenticateJWT, CVTemplateController.getUserCV);

// Preview and export
router.post('/user-cvs/preview', authenticateJWT, CVTemplateController.renderPreview);
router.get('/user-cvs/:id/export-pdf', authenticateJWT, CVTemplateController.exportPDF);

export default router;
