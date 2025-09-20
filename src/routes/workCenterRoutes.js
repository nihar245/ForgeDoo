import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { list, get, create, update, remove, utilization, upsert, listCosts } from '../controllers/workCenterController.js';

const router = express.Router();
router.use(requireAuth);
router.get('/', list);
router.get('/_utilization', authorize('admin','manager','viewer'), utilization);
router.get('/costs', listCosts);
router.post('/upsert', authorize('admin','manager'), upsert);
router.get('/:id', get);
router.post('/', authorize('admin','manager'), create);
router.patch('/:id', authorize('admin','manager'), update);
router.delete('/:id', authorize('admin','manager'), remove);
export default router;
