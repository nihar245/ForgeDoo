import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { listAll, productInventory, adjust } from '../controllers/inventoryController.js';

const router = express.Router();
router.use(requireAuth);
router.get('/', authorize('admin','manager','inventory'), listAll);
router.get('/product/:id', productInventory); // all roles
router.post('/product/:id/adjust', authorize('admin','manager','inventory'), adjust);
export default router;
