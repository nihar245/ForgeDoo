import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { list, getOne, updateOne, listWoSchema, updateWoSchema, assign, start, pause, resume, complete, comment, generate } from '../controllers/woController.js';

const router = Router();

// Authenticate all WO routes
router.use(requireAuth);

router.get('/', authorize('admin','manager','operator','viewer'), list);
router.post('/generate/:moId', authorize('admin','manager'), generate);
router.get('/:id', authorize('admin','manager','operator','viewer'), getOne);
router.patch('/:id', authorize('admin','manager','operator'), validate(updateWoSchema), updateOne);
router.post('/:id/assign', authorize('admin','manager'), assign);
router.post('/:id/start', authorize('admin','manager','operator'), start);
router.post('/:id/pause', authorize('admin','manager','operator'), pause);
router.post('/:id/resume', authorize('admin','manager','operator'), resume);
router.post('/:id/complete', authorize('admin','manager','operator'), complete);
router.post('/:id/comment', authorize('admin','manager','operator'), comment);

export default router;
