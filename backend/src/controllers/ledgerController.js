import Joi from 'joi';
import { 
  getStockSummary, 
  getAllLedgerEntries, 
  addStockMovement, 
  getLedgerEntry 
} from '../models/stockLedger.js';

// GET /ledger : stock summary (one row per product)
// Fields: product_id, name, uom, unit_cost, on_hand, free_to_use, incoming, outgoing, total_value
export async function stockSummary(_req, res, next) {
  try {
    const data = await getStockSummary();
    res.json({ data });
  } catch (e) { 
    next(e); 
  }
}

// GET /ledger/entries : get stock ledger entries with details
export async function stockEntries(req, res, next) {
  try {
    const { product_id, movement_type, reference, limit = 100, offset = 0 } = req.query;
    const data = await getAllLedgerEntries({ 
      product_id: product_id ? parseInt(product_id) : undefined,
      movement_type, 
      reference, 
      limit: parseInt(limit), 
      offset: parseInt(offset) 
    });
    res.json({ data });
  } catch (e) { 
    next(e); 
  }
}

// POST /ledger/add : add stock (increase on-hand) or remove (if movement_type='out')
export const addStockSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  quantity: Joi.number().positive().required(),
  movement_type: Joi.string().valid('in', 'out').default('in'),
  unit_cost: Joi.number().precision(4).optional(),
  reference: Joi.string().optional()
});

export async function addStock(req, res, next) {
  try {
    const stockData = await addStockSchema.validateAsync(req.body);
    const result = await addStockMovement(stockData);
    res.status(201).json({ 
      data: result.product_summary,
      ledger_entry: result.ledger_entry 
    });
  } catch (e) { 
    next(e); 
  }
}