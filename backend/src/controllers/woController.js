import Joi from 'joi';
import { getWO, listWOs, updateWO, assignWO, startWO, pauseWO, resumeWO, completeWO, commentWO, generateMissingWOs } from '../models/workOrders.js';
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
  console.log('📋 [WO-BACKEND] List work orders request received:', { 
    mo_id: req.query.mo_id,
    status: req.query.status,
    work_center_id: req.query.work_center_id,
    userId: req.user?.id 
  })
  
  try{
    console.log('🔄 [WO-BACKEND] Fetching work orders from database...')
    const data = await listWOs({ mo_id: req.query.mo_id, status: req.query.status, work_center_id: req.query.work_center_id });
    console.log('✅ [WO-BACKEND] Work orders fetched successfully:', { count: data?.length || 0 })
    
    // Add cache-busting headers to prevent 304 responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.json({ data });
  }catch(e){ 
    console.error('❌ [WO-BACKEND] Error listing work orders:', e)
    next(e); 
  }
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
  console.log('▶️ [WO-BACKEND] Start work order request received:', { 
    woId: req.params.id,
    userId: req.user?.id 
  })
  
  try{ 
    console.log('🔄 [WO-BACKEND] Starting work order:', { woId: req.params.id })
    const wo = await startWO(req.params.id); 
    if(!wo) {
      console.error('❌ [WO-BACKEND] Work order not found for start:', { woId: req.params.id })
      throw notFound('Work order not found');
    }
    console.log('✅ [WO-BACKEND] Work order started successfully:', { 
      woId: req.params.id,
      status: wo.status 
    })
    res.json({ data: wo }); 
  }catch(e){ 
    console.error('❌ [WO-BACKEND] Error starting work order:', e)
    next(e); 
  }
}
export async function pause(req,res,next){
  console.log('⏸️ [WO-BACKEND] Pause work order request received:', { 
    woId: req.params.id,
    userId: req.user?.id 
  })
  
  try{ 
    console.log('🔄 [WO-BACKEND] Pausing work order:', { woId: req.params.id })
    const wo = await pauseWO(req.params.id); 
    if(!wo) {
      console.error('❌ [WO-BACKEND] Work order not found for pause:', { woId: req.params.id })
      throw notFound('Work order not found');
    }
    console.log('✅ [WO-BACKEND] Work order paused successfully:', { 
      woId: req.params.id,
      status: wo.status 
    })
    res.json({ data: wo }); 
  }catch(e){ 
    console.error('❌ [WO-BACKEND] Error pausing work order:', e)
    next(e); 
  }
}
export async function resume(req,res,next){
  try{ const wo = await resumeWO(req.params.id); if(!wo) throw notFound('Work order not found'); res.json({ data: wo }); }catch(e){ next(e); }
}
export async function complete(req,res,next){
  console.log('🏁 [WO-BACKEND] Complete work order request received:', { 
    woId: req.params.id,
    userId: req.user?.id 
  })
  
  try{ 
    console.log('🔄 [WO-BACKEND] Completing work order:', { woId: req.params.id })
    const wo = await completeWO(req.params.id); 
    if(!wo) {
      console.error('❌ [WO-BACKEND] Work order not found for completion:', { woId: req.params.id })
      throw notFound('Work order not found');
    }
    console.log('✅ [WO-BACKEND] Work order completed successfully:', { 
      woId: req.params.id,
      status: wo.status 
    })
    res.json({ data: wo }); 
  }catch(e){ 
    console.error('❌ [WO-BACKEND] Error completing work order:', e)
    next(e); 
  }
}
export async function comment(req,res,next){
  try{ const wo = await commentWO(req.params.id, req.body.comment); if(!wo) throw notFound('Work order not found'); res.json({ data: wo }); }catch(e){ next(e); }
}

// Generate missing work orders for a Manufacturing Order
export async function generate(req,res,next){
  const moId = req.params.moId;
  console.log('🛠️ [WO-BACKEND] Generate missing WOs request received:', { moId });
  try {
    const result = await generateMissingWOs(moId);
    if(result.status === 'mo_not_found') return res.status(404).json({ error: 'Manufacturing order not found' });
    res.json({ data: result });
  } catch(e){
    console.error('❌ [WO-BACKEND] Error generating work orders:', e);
    next(e);
  }
}
