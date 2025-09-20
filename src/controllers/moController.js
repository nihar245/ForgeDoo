import { ApiError, notFound } from '../core/apiError.js';
import Joi from 'joi';
import { createMO, getMO, listMOs, listLateMOs, setMOStatus, updateMO, deleteMO, getMOCost, attachBOM, checkAndReserveComponents, computeComponentsAvailability } from '../models/manufacturingOrders.js';
import { query } from '../config/db.js';
import { sendMail } from '../utils/mailer.js';
import { getBom } from '../models/boms.js';
import { createWO } from '../models/workOrders.js';
import { listWOs } from '../models/workOrders.js';

// Old create schema replaced by two flows below

export const createMoByProductSchema = Joi.object({
  product_name: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  assignee_id: Joi.number().integer().optional(),
  bom_id: Joi.number().integer().optional() // user selects BOM after choosing product
});

export const createMoByBomSchema = Joi.object({
  bom_id: Joi.number().integer().required(),
  quantity: Joi.number().positive().required(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  assignee_id: Joi.number().integer().optional()
});

export const updateMoSchema = Joi.object({
  quantity: Joi.number().positive().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  status: Joi.string().valid('draft','confirmed','in_progress','done','cancelled').optional(),
  assignee_id: Joi.number().integer().optional()
});

export async function list(req,res,next){
  try{
  const data = await listMOs({ status: req.query.status, product: req.query.product_id });
    res.json({ data });
  }catch(e){ next(e); }
}

// List manufacturing orders by explicit status path param (alternative to query param)
export async function listByStatus(req,res,next){
  try {
    const status = req.params.status;
    const allowed = ['draft','confirmed','in_progress','done'];
    if(!allowed.includes(status)) return next(new ApiError(400,'Invalid status value'));
    const data = await listMOs({ status });
    res.json({ data });
  } catch(e){ next(e); }
}

// List MOs for a given creator (user id) AND status: /mos/:id/:status
export async function listByUserAndStatus(req,res,next){
  try {
    const userId = parseInt(req.params.id,10);
    if(Number.isNaN(userId)) return next(new ApiError(400,'Invalid user id'));
  const status = req.params.status;
  const allowed = ['draft','confirmed','in_progress','done'];
  if(!allowed.includes(status)) return next(new ApiError(400,'Invalid status value'));
    const data = await listMOs({ status, created_by: userId });
    res.json({ data });
  } catch(e){ next(e); }
}

// List all late MOs
export async function listLate(req,res,next){
  try {
    const data = await listLateMOs();
    res.json({ data });
  } catch(e){ next(e); }
}

// List late MOs for a given user id
export async function listLateByUser(req,res,next){
  try {
    const userId = parseInt(req.params.id,10);
    if(Number.isNaN(userId)) return next(new ApiError(400,'Invalid user id'));
    const data = await listLateMOs({ created_by: userId });
    res.json({ data });
  } catch(e){ next(e); }
}

// Flow 1: Create by product name (product resolved, optional bom chosen)
export async function createByProduct(req,res,next){
  try {
    const { product_name, quantity, start_date, end_date, assignee_id, bom_id } = req.body;
    const prodRes = await query('SELECT id FROM products WHERE name=$1 LIMIT 1',[product_name]);
    if(!prodRes.rowCount) return next(new ApiError(400,'Product not found'));
    // Validate BOM belongs to product if provided
    if(bom_id){
      const bomRes = await query('SELECT id FROM bom WHERE id=$1 AND product_id=$2',[bom_id, prodRes.rows[0].id]);
      if(!bomRes.rowCount) return next(new ApiError(400,'BOM does not belong to product'));
    }
    const mo = await createMO({ product_id: prodRes.rows[0].id, quantity, start_date, end_date, assignee_id, bom_id });
    res.status(201).json({ data: mo });
  } catch(e){ next(e); }
}

// Flow 2: Create by BOM (auto-populate product from BOM)
export async function createByBom(req,res,next){
  try {
    const { bom_id, quantity, start_date, end_date, assignee_id } = req.body;
    const bomRes = await query('SELECT b.id,b.product_id FROM bom b WHERE b.id=$1',[bom_id]);
    if(!bomRes.rowCount) return next(new ApiError(400,'BOM not found'));
    const mo = await createMO({ product_id: bomRes.rows[0].product_id, quantity, start_date, end_date, assignee_id, bom_id });
    // Auto-create work orders based on BOM operations (pending status)
    const opsRes = await query('SELECT operation_name FROM bom_operations WHERE bom_id=$1 ORDER BY id',[bom_id]);
    for(const op of opsRes.rows){
      await createWO({ mo_id: mo.id, operation_name: op.operation_name, status: 'pending' });
    }
    const refreshed = await getMO(mo.id);
    res.status(201).json({ data: refreshed });
  } catch(e){ next(e); }
}

export async function getOne(req,res,next){
  try{
    const mo = await getMO(req.params.id);
    if(!mo) throw notFound('Manufacturing order not found');
    res.json({ data: mo });
  }catch(e){ next(e); }
}

export async function updateOne(req,res,next){
  try{
    const mo = await updateMO(req.params.id, req.body);
    if(!mo) throw notFound('Manufacturing order not found');
    res.json({ data: mo });
  }catch(e){ next(e); }
}

export async function confirm(req,res,next){
  try {
    const id = req.params.id;
    const mo = await getMO(id);
    if(!mo) throw notFound('Manufacturing order not found');
  if(mo.status === 'cancelled') throw new ApiError(400,'Cannot confirm a cancelled MO');
  if(mo.status !== 'draft') throw new ApiError(400, 'Only draft MO can be confirmed');
    // Use updateMO path to stay consistent with other patch logic
    await updateMO(id, { status: 'confirmed' });
    try {
      await checkAndReserveComponents(id);
    } catch(reserveErr){
      console.error('Component reservation failed', reserveErr.message);
    }
    const refreshed = await getMO(id);
    res.json({ data: refreshed });
  } catch(e){ next(e); }
}

export async function start(req,res,next){
  try {
    const id = req.params.id; const mo = await getMO(id);
  if(!mo) throw notFound('Manufacturing order not found');
  if(!['confirmed','in_progress'].includes(mo.status)) throw new ApiError(400, 'Must be confirmed to start');
    const updated = await setMOStatus(id,'in_progress');
    res.json({ data: updated });
  }catch(e){ next(e); }
}

// requestClose removed: direct completion from in_progress to done

export async function complete(req,res,next){
  try {
    const id = req.params.id; const mo = await getMO(id);
    if(!mo) throw notFound('Manufacturing order not found');
    if(mo.status !== 'in_progress') throw new ApiError(400, 'Only in_progress MO can be completed');
    const updated = await setMOStatus(id,'done');
    const creatorRes = await query('SELECT u.email, u.name FROM users u JOIN manufacturing_orders m ON m.created_by=u.id WHERE m.id=$1',[id]);
    if(creatorRes.rowCount && updated){
      await sendMail({
        to: creatorRes.rows[0].email,
        subject: `MO ${updated.reference} Completed`,
        text: `Manufacturing order ${updated.reference} has been marked done.`
      }).catch(()=>{});
    }
    res.json({ data: updated });
  }catch(e){ next(e); }
}

// Lifecycle simplified: draft -> confirmed -> in_progress -> done (or cancelled)

export async function remove(req,res,next){
  try{
    const ok = await deleteMO(req.params.id);
  if(!ok) throw notFound('Manufacturing order not found or cannot delete');
    res.status(204).end();
  }catch(e){ next(e); }
}

// attachBom postponed: schema currently has no bom linkage fields; left unimplemented.
export async function attachBom(req,res,next){
  try {
    const mo = await attachBOM(req.params.id, req.body.bom_id);
  if(!mo) throw notFound('Manufacturing order not found or cannot attach BOM');
    res.json({ data: mo });
  } catch(e){ next(e); }
}

export async function cost(req,res,next){
  try {
    const result = await getMOCost(req.params.id);
  if(!result) throw notFound('Manufacturing order not found');
    res.json({ data: result });
  } catch(e){ next(e); }
}

// Components availability endpoint
export async function getComponentsAvailability(req,res,next){
  try {
    const moId = req.params.id;
    const data = await computeComponentsAvailability(moId);
    if(!data) throw notFound('Manufacturing order not found');
    res.json({ data });
  } catch(e){ next(e); }
}

// Work orders for MO
export async function listMoWorkOrders(req,res,next){
  try {
    const moId = parseInt(req.params.id,10);
    if(Number.isNaN(moId)) return next(new ApiError(400,'Invalid MO id'));
    // reuse listWOs with mo filter
    const data = await listWOs({ mo_id: moId });
    res.json({ data });
  } catch(e){ next(e); }
}
