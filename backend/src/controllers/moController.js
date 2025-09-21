import { ApiError, notFound } from '../core/apiError.js';
import Joi from 'joi';
import { createMO, getMO, listMOs, listLateMOs, setMOStatus, updateMO, deleteMO, getMOCost, attachBOM, checkAndReserveComponents, computeComponentsAvailability } from '../models/manufacturingOrders.js';
import { query } from '../config/db.js';
import { sendMail } from '../utils/mailer.js';
import { getBom } from '../models/boms.js';
import { createWO } from '../models/workOrders.js';
import { listWOs } from '../models/workOrders.js';
import { listUsers } from '../models/users.js';

// Old create schema replaced by two flows below

export const createMoByProductSchema = Joi.object({
  product_id: Joi.number().integer().required(), // ✅ Changed to product_id
  quantity: Joi.number().positive().required(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  assignee_id: Joi.number().integer().optional(),
  bom_id: Joi.number().integer().optional()
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
  console.log('📋 [MO-BACKEND] List MOs request received:', { 
    status: req.query.status, 
    product_id: req.query.product_id,
    userId: req.user?.id 
  })
  
  try{
    console.log('🔄 [MO-BACKEND] Fetching MOs from database...')
    const data = await listMOs({ status: req.query.status, product: req.query.product_id });
    console.log('✅ [MO-BACKEND] MOs fetched successfully:', { count: data?.length || 0 })
    
    // Add cache-busting headers to prevent 304 responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.json({ data });
  }catch(e){ 
    console.error('❌ [MO-BACKEND] Error listing MOs:', e)
    next(e); 
  }
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
  console.log('📝 [MO-BACKEND] Create MO by product request received:', {
    body: req.body,
    userId: req.user?.id,
    userRole: req.user?.role
  })
  
  try {
    const { product_id, quantity, start_date, end_date, assignee_id, bom_id } = req.body; // ✅ Changed to product_id
    
    console.log('🔍 [MO-BACKEND] Validating product existence:', { product_id })
    // Validate product exists
    const prodRes = await query('SELECT id FROM products WHERE id=$1 LIMIT 1',[product_id]); // ✅ Changed query
    if(!prodRes.rowCount) {
      console.error('❌ [MO-BACKEND] Product not found:', { product_id })
      return next(new ApiError(400,'Product not found'));
    }
    console.log('✅ [MO-BACKEND] Product validated successfully')
    
    // Validate BOM belongs to product if provided
    if(bom_id){
      console.log('🔍 [MO-BACKEND] Validating BOM belongs to product:', { bom_id, product_id })
      const bomRes = await query('SELECT id FROM bom WHERE id=$1 AND product_id=$2',[bom_id, product_id]); // ✅ Use product_id directly
      if(!bomRes.rowCount) {
        console.error('❌ [MO-BACKEND] BOM does not belong to product:', { bom_id, product_id })
        return next(new ApiError(400,'BOM does not belong to product'));
      }
      console.log('✅ [MO-BACKEND] BOM validated successfully')
    }
    
    console.log('🔄 [MO-BACKEND] Creating MO in database...')
    const mo = await createMO({ product_id, quantity, start_date, end_date, assignee_id, bom_id });
    console.log('✅ [MO-BACKEND] MO created successfully:', { 
      moId: mo.id, 
      reference: mo.reference, 
      status: mo.status 
    })
    
    res.status(201).json({ data: mo });
  } catch(e){ 
    console.error('❌ [MO-BACKEND] Error creating MO by product:', e)
    next(e); 
  }
}
// Flow 2: Create by BOM (auto-populate product from BOM)
export async function createByBom(req,res,next){
  console.log('🔧 [MO-BACKEND] Create MO by BOM request received:', {
    body: req.body,
    userId: req.user?.id
  })
  
  try {
    const { bom_id, quantity, start_date, end_date, assignee_id } = req.body;
    
    console.log('� [MO-BACKEND] Parsed request parameters:', {
      bom_id,
      bom_id_type: typeof bom_id,
      quantity,
      quantity_type: typeof quantity,
      start_date,
      start_date_type: typeof start_date,
      end_date,
      end_date_type: typeof end_date,
      assignee_id,
      assignee_id_type: typeof assignee_id
    })
    
    console.log('�🔍 [MO-BACKEND] Validating BOM existence:', { bom_id })
    const bomRes = await query('SELECT b.id,b.product_id FROM bom b WHERE b.id=$1',[bom_id]);
    if(!bomRes.rowCount) {
      console.error('❌ [MO-BACKEND] BOM not found:', { bom_id })
      return next(new ApiError(400,'BOM not found'));
    }
    console.log('✅ [MO-BACKEND] BOM validated successfully:', { 
      bom_id, 
      product_id: bomRes.rows[0].product_id 
    })
    
    console.log('🔄 [MO-BACKEND] Creating MO from BOM...')
    const mo = await createMO({ product_id: bomRes.rows[0].product_id, quantity, start_date, end_date, assignee_id, bom_id });
    console.log('✅ [MO-BACKEND] MO created from BOM:', { 
      moId: mo.id, 
      reference: mo.reference 
    })
    
    console.log('🔄 [MO-BACKEND] Creating work orders from BOM operations...')
    // Auto-create work orders based on BOM operations (pending status)
    const opsRes = await query('SELECT id, operation_name, sequence, workcenter_id, duration_mins FROM bom_operations WHERE bom_id=$1 ORDER BY sequence, id',[bom_id]);
    console.log('📋 [MO-BACKEND] Found BOM operations:', { count: opsRes.rows.length })

    if(opsRes.rows.length){
      for(const op of opsRes.rows){
        console.log('🔄 [MO-BACKEND] Creating work order for operation:', {
          operation_id: op.id,
          operation_name: op.operation_name,
          sequence: op.sequence,
          workcenter_id: op.workcenter_id,
          duration_mins: op.duration_mins
        })
        try {
          const woData = { mo_id: mo.id, operation_name: op.operation_name, status: 'pending' };
          await createWO(woData);
          console.log('✅ [MO-BACKEND] Work order created successfully for operation:', op.operation_name)
        } catch (woError) {
          console.error('❌ [MO-BACKEND] Error creating work order for operation:', { operation_name: op.operation_name, error: woError.message });
          throw woError;
        }
      }
      console.log('✅ [MO-BACKEND] All work orders created successfully')
    } else {
      console.log('⚠️ [MO-BACKEND] No BOM operations defined. Generating fallback work orders...')
      // Strategy: use up to first 3 work centers or a single generic operation
      const wcRes = await query('SELECT id,name FROM work_centers ORDER BY id LIMIT 3');
      if(wcRes.rowCount){
        let seq=1;
        for(const wc of wcRes.rows){
          const opName = `Operation ${seq} - ${wc.name}`;
          try {
            await createWO({ mo_id: mo.id, operation_name: opName, status: 'pending' });
            console.log('✅ [MO-BACKEND] Fallback work order created:', opName)
          } catch(e){
            console.error('❌ [MO-BACKEND] Failed to create fallback WO:', opName, e.message)
          }
          seq++;
        }
      } else {
        const genericOp = 'Operation 1 - Assembly';
        try {
          await createWO({ mo_id: mo.id, operation_name: genericOp, status: 'pending' });
          console.log('✅ [MO-BACKEND] Generic fallback work order created')
        } catch(e){
          console.error('❌ [MO-BACKEND] Failed to create generic fallback WO:', e.message)
        }
      }
    }
    console.log('🔄 [MO-BACKEND] Fetching refreshed MO data...')
    const refreshed = await getMO(mo.id);
    console.log('✅ [MO-BACKEND] MO creation by BOM completed successfully:', {
      moId: refreshed.id,
      reference: refreshed.reference,
      workOrdersCount: refreshed.work_orders?.length || 0
    })
    
    res.status(201).json({ data: refreshed });
  } catch(e){ 
    console.error('❌ [MO-BACKEND] Error in createByBom:', {
      error: e.message,
      stack: e.stack,
      requestBody: req.body
    })
    next(e); 
  }
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
  console.log('✅ [MO-BACKEND] Confirm MO request received:', { 
    moId: req.params.id,
    userId: req.user?.id 
  })
  
  try {
    const id = req.params.id;
    console.log('🔍 [MO-BACKEND] Fetching MO for confirmation:', { id })
    
    const mo = await getMO(id);
    if(!mo) {
      console.error('❌ [MO-BACKEND] MO not found for confirmation:', { id })
      throw notFound('Manufacturing order not found');
    }
    
    console.log('📋 [MO-BACKEND] MO found, checking status:', { 
      id, 
      currentStatus: mo.status,
      reference: mo.reference 
    })
    
    if(mo.status === 'cancelled') {
      console.error('❌ [MO-BACKEND] Cannot confirm cancelled MO:', { id, status: mo.status })
      throw new ApiError(400,'Cannot confirm a cancelled MO');
    }
    if(mo.status !== 'draft') {
      console.error('❌ [MO-BACKEND] Only draft MO can be confirmed:', { id, status: mo.status })
      throw new ApiError(400, 'Only draft MO can be confirmed');
    }
    
    console.log('🔄 [MO-BACKEND] Updating MO status to confirmed...')
    // Use updateMO path to stay consistent with other patch logic
    await updateMO(id, { status: 'confirmed' });
    console.log('✅ [MO-BACKEND] MO status updated to confirmed')
    
    console.log('🔄 [MO-BACKEND] Checking and reserving components...')
    try {
      await checkAndReserveComponents(id);
      console.log('✅ [MO-BACKEND] Components reserved successfully')
    } catch(reserveErr){
      console.error('⚠️ [MO-BACKEND] Component reservation failed:', reserveErr.message);
    }
    
    console.log('🔄 [MO-BACKEND] Fetching refreshed MO data...')
    const refreshed = await getMO(id);
    console.log('✅ [MO-BACKEND] MO confirmation completed successfully:', { 
      id, 
      status: refreshed.status 
    })
    
    res.json({ data: refreshed });
  } catch(e){ 
    console.error('❌ [MO-BACKEND] Error confirming MO:', e)
    next(e); 
  }
}

export async function start(req,res,next){
  console.log('▶️ [MO-BACKEND] Start MO request received:', { 
    moId: req.params.id,
    userId: req.user?.id 
  })
  
  try {
    const id = req.params.id; 
    console.log('🔍 [MO-BACKEND] Fetching MO for start:', { id })
    
    const mo = await getMO(id);
    if(!mo) {
      console.error('❌ [MO-BACKEND] MO not found for start:', { id })
      throw notFound('Manufacturing order not found');
    }
    
    console.log('📋 [MO-BACKEND] MO found, checking status for start:', { 
      id, 
      currentStatus: mo.status,
      reference: mo.reference 
    })
    
    if(!['confirmed','in_progress'].includes(mo.status)) {
      console.error('❌ [MO-BACKEND] Invalid status for start:', { id, status: mo.status })
      throw new ApiError(400, 'Must be confirmed to start');
    }
    
    console.log('🔄 [MO-BACKEND] Setting MO status to in_progress...')
    const updated = await setMOStatus(id,'in_progress');
    console.log('✅ [MO-BACKEND] MO started successfully:', { 
      id, 
      newStatus: updated.status 
    })
    
    res.json({ data: updated });
  }catch(e){ 
    console.error('❌ [MO-BACKEND] Error starting MO:', e)
    next(e); 
  }
}

// requestClose removed: direct completion from in_progress to done

export async function complete(req,res,next){
  console.log('🏁 [MO-BACKEND] Complete MO request received:', { 
    moId: req.params.id,
    userId: req.user?.id 
  })
  
  try {
    const id = req.params.id; 
    console.log('🔍 [MO-BACKEND] Fetching MO for completion:', { id })
    
    const mo = await getMO(id);
    if(!mo) {
      console.error('❌ [MO-BACKEND] MO not found for completion:', { id })
      throw notFound('Manufacturing order not found');
    }
    
    console.log('📋 [MO-BACKEND] MO found, checking status for completion:', { 
      id, 
      currentStatus: mo.status,
      reference: mo.reference 
    })
    
    if(mo.status !== 'in_progress') {
      console.error('❌ [MO-BACKEND] Invalid status for completion:', { id, status: mo.status })
      throw new ApiError(400, 'Only in_progress MO can be completed');
    }
    
    console.log('🔄 [MO-BACKEND] Setting MO status to done...')
    const updated = await setMOStatus(id,'done');
    console.log('✅ [MO-BACKEND] MO completed successfully:', { 
      id, 
      newStatus: updated.status,
      reference: updated.reference 
    })
    
    console.log('📧 [MO-BACKEND] Sending completion notification email...')
    const creatorRes = await query('SELECT u.email, u.name FROM users u JOIN manufacturing_orders m ON m.created_by=u.id WHERE m.id=$1',[id]);
    if(creatorRes.rowCount && updated){
      console.log('📧 [MO-BACKEND] Sending email to creator:', { 
        email: creatorRes.rows[0].email,
        name: creatorRes.rows[0].name 
      })
      await sendMail({
        to: creatorRes.rows[0].email,
        subject: `MO ${updated.reference} Completed`,
        text: `Manufacturing order ${updated.reference} has been marked done.`
      }).catch((emailErr) => {
        console.error('⚠️ [MO-BACKEND] Failed to send completion email:', emailErr)
      });
      console.log('📧 [MO-BACKEND] Completion email sent successfully')
    }
    
    res.json({ data: updated });
  }catch(e){ 
    console.error('❌ [MO-BACKEND] Error completing MO:', e)
    next(e); 
  }
}

export async function cancel(req,res,next){
  console.log('❌ [MO-BACKEND] Cancel MO request received:', { 
    moId: req.params.id,
    userId: req.user?.id 
  })
  
  try {
    const id = req.params.id; 
    console.log('🔍 [MO-BACKEND] Fetching MO for cancellation:', { id })
    
    const mo = await getMO(id);
    if(!mo) {
      console.error('❌ [MO-BACKEND] MO not found for cancellation:', { id })
      throw notFound('Manufacturing order not found');
    }
    
    console.log('📋 [MO-BACKEND] MO found, checking status for cancellation:', { 
      id, 
      currentStatus: mo.status,
      reference: mo.reference 
    })
    
    if(['done','cancelled'].includes(mo.status)) {
      console.error('❌ [MO-BACKEND] Invalid status for cancellation:', { id, status: mo.status })
      throw new ApiError(400, 'Cannot cancel completed or already cancelled MO');
    }
    const updated = await setMOStatus(id,'cancelled');
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

// ------------------------------------------------------------
// BOM Preview (for MO creation wizard)
// GET /mos/preview/bom/:bomId?quantity=Q
// Returns: { bom_id, product_id, product_name, quantity, output_quantity, components: [ { product_id, product_name, uom, unit_cost, per_output_qty, required_qty } ], operations: [...] }
// Does not create MO; safe for UI to call when user selects a BOM.
// ------------------------------------------------------------
export async function previewBomForMO(req,res,next){
  try {
    const bomId = parseInt(req.params.bomId,10);
    if(Number.isNaN(bomId)) return next(new ApiError(400,'Invalid BOM id'));
    const targetQty = req.query.quantity ? Number(req.query.quantity) : 1;
    if(Number.isNaN(targetQty) || targetQty <= 0) return next(new ApiError(400,'Invalid quantity'));
    const bom = await getBom(bomId);
    if(!bom) return next(notFound('BOM not found'));
    const outputQty = bom.output_quantity || 1;
    // Map components with required quantity for desired MO quantity
    const components = (bom.components||[]).map(c => {
      const perOutput = Number(c.quantity); // quantity stored is per BOM output batch
      const scaleFactor = targetQty / outputQty;
      const required = perOutput * scaleFactor;
      return {
        product_id: c.product_id,
        product_name: c.product_name,
        uom: c.uom,
        unit_cost: c.unit_cost,
        per_output_qty: perOutput,
        required_qty: Number(required.toFixed(4))
      };
    });
    const operations = (bom.operations||[]).map(o => ({
      id: o.id,
      operation_name: o.operation_name,
      sequence: o.sequence,
      workcenter_id: o.workcenter_id,
      work_center_name: o.work_center_name,
      duration_mins: o.duration_mins
    }));
    res.json({
      data: {
        bom_id: bom.id,
        product_id: bom.product_id,
        product_name: bom.product_name,
        quantity: targetQty,
        output_quantity: outputQty,
        components,
        operations
      }
    });
  } catch(e){ next(e); }
}

// Get assignable users (operators) for manufacturing orders
export async function getAssignees(req,res,next){
  try {
    const users = await listUsers();
    // Filter users who have 'operator' in their role
    const operators = users.filter(user => 
      user.role && user.role.toLowerCase().includes('operator')
    );
    
    // Return formatted data for frontend dropdown
    const assignees = operators.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }));
    
    res.json({ data: assignees });
  } catch(e){ next(e); }
}
