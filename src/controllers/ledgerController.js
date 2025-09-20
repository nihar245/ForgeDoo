import Joi from 'joi';
import { listLedger, getLedgerEntry } from '../models/stockLedger.js';
import { notFound } from '../core/apiError.js';

export const listLedgerSchema = Joi.object({
  product_id: Joi.number().integer().optional(),
  movement_type: Joi.string().valid('in','out').optional(),
  ref: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(500).optional(),
  offset: Joi.number().integer().min(0).optional()
});

export async function list(req,res,next){
  try {
    const data = await listLedger({ 
      product_id: req.query.product_id, 
      movement_type: req.query.movement_type, 
      ref: req.query.ref,
      limit: req.query.limit? parseInt(req.query.limit,10):100,
      offset: req.query.offset? parseInt(req.query.offset,10):0
    });
    res.json({ data });
  } catch(e){ next(e); }
}

export async function getOne(req,res,next){
  try {
    const entry = await getLedgerEntry(req.params.id);
  if(!entry) throw notFound('Ledger entry not found');
    res.json({ data: entry });
  } catch(e){ next(e); }
}