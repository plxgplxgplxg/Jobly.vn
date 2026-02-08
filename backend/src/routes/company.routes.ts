import { Router } from 'express';
import CompanyController from '../controllers/CompanyController';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', CompanyController.listCompanies);
router.get('/:id', CompanyController.getCompany);
router.get('/:id/jobs', CompanyController.getCompanyJobs);

router.post('/', authenticateJWT, CompanyController.createCompany);
router.put('/:id', authenticateJWT, CompanyController.updateCompany);
router.delete('/:id', authenticateJWT, CompanyController.deleteCompany);

export default router;
