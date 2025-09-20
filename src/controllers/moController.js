import { ApiError, notFound } from '../core/apiError.js';
import Joi from 'joi';
import { createMO, getMO, listMOs, listLateMOs, setMOStatus, updateMO, deleteMO, getMOCost, attachBOM, checkAndReserveComponents } from '../models/manufacturingOrders.js';
import { query } from '../config/db.js';
import { sendMail } from '../utils/mailer.js';
import { getBom } from '../models/boms.js';
import { createWO } from '../models/workOrders.js';

export const createMoSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  quantity: Joi.number().positive().required(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional()
});

export const updateMoSchema = Joi.object({
  quantity: Joi.number().positive().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  status: Joi.string().valid('draft','confirmed','in_progress','to_close','not_assigned').optional()
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
    const allowed = ['draft','confirmed','in_progress','to_close','not_assigned'];
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
    const allowed = ['draft','confirmed','in_progress','to_close','not_assigned'];
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

export async function create(req,res,next){
  try{
    const mo = await createMO(req.body);
    res.status(201).json({ data: mo });
  }catch(e){ next(e); }
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
  // NOTE: ApiError signature is (status, message). Previous order was reversed causing wrong status/message.
  if(mo.status !== 'draft') throw new ApiError(400, 'Only draft MO can be confirmed');
    const updated = await setMOStatus(id,'confirmed');
    // After confirming, attempt to reserve components
    try {
      await checkAndReserveComponents(id);
    } catch(reserveErr){
      // Log only; do not fail confirmation if reservation logic errors
      console.error('Component reservation failed', reserveErr.message);
    }
    const refreshed = await getMO(id); // include component_status
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

export async function requestClose(req,res,next){
  try {
    const id = req.params.id; const mo = await getMO(id);
  if(!mo) throw notFound('Manufacturing order not found');
  if(mo.status !== 'in_progress') throw new ApiError(400, 'Only in_progress MO can move to to_close');
    const updated = await setMOStatus(id,'to_close');
    res.json({ data: updated });
  }catch(e){ next(e); }
}

export async function complete(req,res,next){
  try {
    const id = req.params.id; const mo = await getMO(id);
  if(!mo) throw notFound('Manufacturing order not found');
  if(mo.status !== 'to_close') throw new ApiError(400, 'Only to_close MO can be marked not_assigned');
    const updated = await setMOStatus(id,'not_assigned');
    // Email notify creator if enabled
    const creatorRes = await query('SELECT u.email, u.name FROM users u JOIN manufacturing_orders m ON m.created_by=u.id WHERE m.id=$1',[id]);
    if(creatorRes.rowCount && updated){
      await sendMail({
        to: creatorRes.rows[0].email,
        subject: `MO ${updated.reference} Completed`,
        text: `Manufacturing order ${updated.reference} has been marked not_assigned.`
      }).catch(()=>{});
    }
    res.json({ data: updated });
  }catch(e){ next(e); }
}

// cancel removed in new lifecycle (draft->confirmed->in_progress->to_close->not_assigned)

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
