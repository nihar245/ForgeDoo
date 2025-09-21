import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { list, listByRole, patch, remove, exportUser } from '../controllers/userAdminController.js';

const router = express.Router();
router.use(requireAuth, authorize('admin'));
router.get('/', list);
router.get('/by-role', listByRole);
router.patch('/:id', patch);
router.delete('/:id', remove);
router.get('/:id/export', exportUser);
export default router;
