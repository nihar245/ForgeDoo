import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import { requireAuth } from '../middleware/auth.js';
import { throughputReport, userWorkSummary } from '../controllers/reportsController.js';

const router = Router();

// Require authentication before role-based authorization
router.use(requireAuth);
router.get('/throughput', authorize('admin','manager','viewer'), throughputReport);
router.get('/user-work', authorize('admin','manager'), userWorkSummary);

export default router;
