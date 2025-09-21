import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { myProfile, myWorkOrdersReport } from '../controllers/selfController.js';

const router = Router();
router.use(requireAuth);

router.get('/profile', myProfile);
router.get('/reports/work-orders', myWorkOrdersReport);

export default router;
