import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { createByProduct, createByBom, list, listByStatus, listByUserAndStatus, listLate, listLateByUser, getOne, updateOne, confirm, start, complete, cancel, createMoByProductSchema, createMoByBomSchema, updateMoSchema, cost, remove, attachBom, getComponentsAvailability, listMoWorkOrders, getAssignees, previewBomForMO } from '../controllers/moController.js';

const router = Router();

// Ensure the user is authenticated for all MO routes
router.use(requireAuth);

router.get('/', authorize('admin','manager','operator','inventory'), list);
router.get('/assignees', authorize('admin','manager','inventory'), getAssignees);
router.get('/status/:status', authorize('admin','manager','operator','inventory'), listByStatus);
router.get('/late', authorize('admin','manager','operator','inventory'), listLate);
router.get('/late/user/:id', authorize('admin','manager','operator','inventory'), listLateByUser);
router.get('/:id/:status', authorize('admin','manager','operator','inventory'), listByUserAndStatus);

// Important: place before '/:id' to avoid shadowing

router.post('/create/by-product', authorize('admin','manager'), validate(createMoByProductSchema), createByProduct);
router.post('/create/by-bom', authorize('admin','manager'), validate(createMoByBomSchema), createByBom);

router.get('/preview/bom/:bomId', authorize('admin','manager','operator','inventory'), previewBomForMO);
router.get('/:id/components', authorize('admin','manager','operator','inventory'), getComponentsAvailability);
router.get('/:id/work-orders', authorize('admin','manager','operator','inventory'), listMoWorkOrders);

router.get('/:id', authorize('admin','manager','operator','inventory'), getOne);
router.patch('/:id', authorize('admin','manager'), validate(updateMoSchema), updateOne);

router.post('/:id/confirm', authorize('admin','manager'), confirm);

router.post('/:id/start', authorize('admin','manager'), start);
router.post('/:id/complete', authorize('admin','manager'), complete);
router.post('/:id/cancel', authorize('admin','manager'), cancel);
router.get('/:id/cost', authorize('admin','manager','inventory'), cost);
router.delete('/:id', authorize('admin','manager'), remove);
router.post('/:id/attach-bom', authorize('admin','manager'), attachBom);
    
export default router;
