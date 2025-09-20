import Joi from 'joi';
import { getInventoryForProduct, listInventory, adjustInventory } from '../models/inventory.js';
import { query } from '../config/db.js';
import { badRequest, notFound } from '../core/apiError.js';

export async function listAll(req,res,next){ try { res.json({ items: await listInventory()}); } catch(e){ next(e);} }
export async function productInventory(req,res,next){
  try {
    const id = parseInt(req.params.id,10);
    res.json({ item: await getInventoryForProduct(id) });
  } catch(e){ next(e);} }

const adjustSchema = Joi.object({ qty: Joi.number().positive().required(), type: Joi.string().valid('IN','OUT','ADJUST').required(), note: Joi.string().allow('',null) });
export async function adjust(req,res,next){
  try {
    const { qty, type, note } = await adjustSchema.validateAsync(req.body);
    const productId = parseInt(req.params.id,10);
    const exists = await query('SELECT id FROM products WHERE id=$1',[productId]);
    if(!exists.rowCount) throw notFound('Product');
    // Map fields to model signature { productId, quantity, movement_type, reference }
  // Map ADJUST to 'in' to satisfy ledger constraint (movement_type IN ('in','out')) while treating as positive delta.
  const movement_type = type.toLowerCase() === 'in' ? 'in' : (type.toLowerCase() === 'out' ? 'out' : 'in');
    const updated = await adjustInventory({ productId, quantity: qty, movement_type, reference: note });
    res.json({ item: updated });
  }catch(e){ next(e);} }
