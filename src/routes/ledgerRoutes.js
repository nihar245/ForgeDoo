import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { list, getOne, listLedgerSchema } from '../controllers/ledgerController.js';

const router = Router();

// Authenticate all ledger routes first
router.use(requireAuth);

// Use canonical roles (legacy roles normalized in users model)
router.get('/', authorize('admin','manager','inventory','operator'), validate(listLedgerSchema, 'query'), list);
router.get('/:id', authorize('admin','manager','inventory','operator'), getOne);

export default router;