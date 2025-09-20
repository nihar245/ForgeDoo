import Joi from 'joi';
import { getWO, listWOs, updateWO, assignWO, startWO, pauseWO, resumeWO, completeWO, commentWO } from '../models/workOrders.js';
import { notFound, ApiError } from '../core/apiError.js';

export const listWoSchema = Joi.object({
  mo_id: Joi.number().integer().optional(),
  status: Joi.string().optional(),
  work_center_id: Joi.number().integer().optional()
});

export const createWoSchema = Joi.object({
  mo_id: Joi.number().integer().required(),
  bom_operation_id: Joi.number().integer().optional(),
  operation_name: Joi.string().required(),
  sequence: Joi.number().integer().min(1).optional(),
  work_center_id: Joi.number().integer().optional(),
  assigned_to: Joi.number().integer().optional(),
  expected_duration_mins: Joi.number().integer().positive().optional()
});

export async function list(req,res,next){
  try{
    const data = await listWOs({ mo_id: req.query.mo_id, status: req.query.status, work_center_id: req.query.work_center_id });
    res.json({ data });
  }catch(e){ next(e); }
}

export async function getOne(req,res,next){
  try{
    const wo = await getWO(req.params.id);
  if(!wo) throw notFound('Work order not found');
    res.json({ data: wo });
  }catch(e){ next(e); }
}

export const updateWoSchema = Joi.object({
  planned_start: Joi.date().optional(),
  planned_end: Joi.date().optional(),
  actual_start: Joi.date().optional(),
  actual_end: Joi.date().optional(),
  status: Joi.string().valid('pending','in_progress','paused','done','cancelled').optional(),
  real_duration_mins: Joi.number().positive().optional(),
  assigned_to: Joi.number().integer().optional()
});

export async function updateOne(req,res,next){
  try{
    const wo = await updateWO(req.params.id, req.body);
  if(!wo) throw notFound('Work order not found');
    res.json({ data: wo });
  }catch(e){ next(e); }
}

export async function assign(req,res,next){
  try{
    const wo = await assignWO(req.params.id, req.body.assignee_id);
  if(!wo) throw notFound('Work order not found');
    res.json({ data: wo });
  }catch(e){ next(e); }
}

export async function start(req,res,next){
  try{ const wo = await startWO(req.params.id); if(!wo) throw notFound('Work order not found'); res.json({ data: wo }); }catch(e){ next(e); }
}
export async function pause(req,res,next){
  try{ const wo = await pauseWO(req.params.id); if(!wo) throw notFound('Work order not found'); res.json({ data: wo }); }catch(e){ next(e); }
}
export async function resume(req,res,next){
  try{ const wo = await resumeWO(req.params.id); if(!wo) throw notFound('Work order not found'); res.json({ data: wo }); }catch(e){ next(e); }
}
export async function complete(req,res,next){
  try{ const wo = await completeWO(req.params.id); if(!wo) throw notFound('Work order not found'); res.json({ data: wo }); }catch(e){ next(e); }
}
export async function comment(req,res,next){
  try{ const wo = await commentWO(req.params.id, req.body.comment); if(!wo) throw notFound('Work order not found'); res.json({ data: wo }); }catch(e){ next(e); }
}
