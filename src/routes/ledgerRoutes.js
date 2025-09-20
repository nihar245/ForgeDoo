import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import { requireAuth } from '../middleware/auth.js';
import { stockSummary, addStock } from '../controllers/ledgerController.js';

const router = Router();

// Authenticate all ledger routes first
router.use(requireAuth);

// Use canonical roles (legacy roles normalized in users model)
router.get('/', authorize('admin','manager','inventory','operator'), stockSummary);
router.post('/add', authorize('admin','manager','inventory'), addStock);

export default router;