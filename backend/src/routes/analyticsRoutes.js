import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import { requireAuth } from '../middleware/auth.js';
import { dashboard, throughput, cycleTime } from '../controllers/analyticsController.js';

const router = Router();

// All analytics endpoints require authentication
router.use(requireAuth);
router.get('/dashboard', authorize('admin','manager','viewer'), dashboard);
router.get('/throughput', authorize('admin','manager','viewer'), throughput);
router.get('/cycle-time', authorize('admin','manager','viewer'), cycleTime);

export default router;
