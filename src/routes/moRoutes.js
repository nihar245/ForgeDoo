import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { create, list, listByStatus, listByUserAndStatus, listLate, listLateByUser, getOne, updateOne, confirm, start, requestClose, complete, createMoSchema, updateMoSchema, cost, remove, attachBom } from '../controllers/moController.js';

const router = Router();

// Ensure the user is authenticated for all MO routes
router.use(requireAuth);

router.get('/', authorize('admin','manager','operator','inventory'), list);
router.get('/status/:status', authorize('admin','manager','operator','inventory'), listByStatus);
router.get('/late', authorize('admin','manager','operator','inventory'), listLate);
router.get('/late/user/:id', authorize('admin','manager','operator','inventory'), listLateByUser);
// Important: place before '/:id' to avoid shadowing
router.get('/:id/:status', authorize('admin','manager','operator','inventory'), listByUserAndStatus);
router.post('/', authorize('admin','manager'), validate(createMoSchema), create);
router.get('/:id', authorize('admin','manager','operator','inventory'), getOne);
router.patch('/:id', authorize('admin','manager'), validate(updateMoSchema), updateOne);
router.post('/:id/confirm', authorize('admin','manager'), confirm);
router.post('/:id/start', authorize('admin','manager'), start);
router.post('/:id/request-close', authorize('admin','manager'), requestClose);
router.post('/:id/complete', authorize('admin','manager'), complete);
router.get('/:id/cost', authorize('admin','manager','inventory'), cost);
router.delete('/:id', authorize('admin','manager'), remove);
router.post('/:id/attach-bom', authorize('admin','manager'), attachBom);

export default router;
