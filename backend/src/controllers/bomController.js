import Joi from 'joi';
import { listBoms, getBom, createBom, updateBom, deleteBom, upsertBom } from '../models/boms.js';
import { notFound } from '../core/apiError.js';

const componentSchema = Joi.object({ product_id: Joi.number().required(), qty_per_unit: Joi.number().positive().required(), uom: Joi.string().default('pcs') });
const operationSchema = Joi.object({ operation_name: Joi.string().required(), work_center_id: Joi.number().required(), duration_mins: Joi.number().integer().positive().required(), sequence: Joi.number().integer().min(1).required() });
const createSchema = Joi.object({ product_id: Joi.number().required(), name: Joi.string().required(), output_quantity: Joi.number().positive().default(1), components: Joi.array().items(componentSchema).min(1).required(), operations: Joi.array().items(operationSchema).min(1).required() });
const updateSchema = Joi.object({ name: Joi.string().optional(), output_quantity: Joi.number().positive().optional(), components: Joi.array().items(componentSchema).optional(), operations: Joi.array().items(operationSchema).optional() });
const upsertSchema = Joi.object({ product_id: Joi.number().required(), reference: Joi.string().required(), output_quantity: Joi.number().positive().default(1), components: Joi.array().items(componentSchema).min(1).required(), operations: Joi.array().items(operationSchema).min(1).required() });

export async function list(req,res,next){ 
  try { 
    // Add cache-busting headers to prevent 304 responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.json({ data: await listBoms() }); 
  } catch(e){ next(e);} 
}
export async function get(req,res,next){ 
  try { 
    const b = await getBom(req.params.id); 
    if(!b) throw notFound('BOM'); 
    // Add cache-busting headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.json({ data: b }); 
  } catch(e){ next(e);} 
}
export async function create(req,res,next){ try { const data = await createSchema.validateAsync(req.body); const b = await createBom(data); res.status(201).json({ item: b }); } catch(e){ next(e);} }
export async function update(req,res,next){ try { const data = await updateSchema.validateAsync(req.body); const b = await updateBom(req.params.id,data); if(!b) throw notFound('BOM'); res.json({ item: b }); } catch(e){ next(e);} }
export async function remove(req,res,next){ try { await deleteBom(req.params.id); res.json({ message: 'Deleted' }); } catch(e){ next(e);} }
export async function upsert(req,res,next){
	try{
		const data = await upsertSchema.validateAsync(req.body);
		const b = await upsertBom({ product_id: data.product_id, name: data.reference, version: data.reference, components: data.components, operations: data.operations, output_quantity: data.output_quantity });
		res.status(201).json({ item: b });
	}catch(e){ next(e); }
}

export async function listRefs(req,res,next){
	try {
		const list = await listBoms();
		const simplified = list.map(b => ({ id: b.id, product_id: b.product_id, product_name: b.product_name, reference: b.version, output_quantity: b.output_quantity }));
		res.json({ items: simplified });
	} catch(e){ next(e); }
}
