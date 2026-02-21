import express from 'express';
import multer from 'multer';
import UserController from '../controllers/UserController';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = express.Router();

// Multer config - store in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB for CV
  }
});

const uploadLogo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB for logo
  }
});

// Profile routes
router.get('/profile', authenticateJWT, UserController.getProfile);
router.put('/profile', authenticateJWT, UserController.updateProfile);
router.put('/profile/complete', authenticateJWT, UserController.completeProfile);
router.post('/avatar', authenticateJWT, uploadLogo.single('avatar'), UserController.uploadAvatar);

// Dashboard routes
router.get('/dashboard/stats', authenticateJWT, UserController.getDashboardStats);

// CV routes
router.post('/cv/upload', authenticateJWT, upload.single('file'), UserController.uploadCV);
router.delete('/cv/:cvId', authenticateJWT, UserController.deleteCV);
router.patch('/cv/:cvId/default', authenticateJWT, UserController.setDefaultCV);
router.get('/cv', authenticateJWT, UserController.listCVs);

// Company routes
router.post('/company', authenticateJWT, UserController.createCompany);
router.put('/company/:companyId', authenticateJWT, UserController.updateCompany);
router.get('/company/:companyId', authenticateJWT, UserController.getCompany);
router.post('/company/:companyId/logo', authenticateJWT, uploadLogo.single('logo'), UserController.uploadLogo);

// Candidate search (for employers)
router.get('/candidates/search', authenticateJWT, UserController.searchCandidates);
router.get('/candidates/:candidateId', authenticateJWT, UserController.getCandidateProfile);

export default router;
