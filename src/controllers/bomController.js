import Joi from 'joi';
import { listBoms, getBom, createBom, updateBom, deleteBom } from '../models/boms.js';
import { notFound } from '../core/apiError.js';

const componentSchema = Joi.object({ component_product_id: Joi.number().required(), qty_per_unit: Joi.number().positive().required(), uom: Joi.string().default('pcs') });
const operationSchema = Joi.object({ operation_name: Joi.string().required(), work_center_id: Joi.number().required(), duration_mins: Joi.number().integer().positive().required(), sequence: Joi.number().integer().min(1).optional() });
const createSchema = Joi.object({ product_id: Joi.number().required(), name: Joi.string().required(), components: Joi.array().items(componentSchema).default([]), operations: Joi.array().items(operationSchema).default([]) });
const updateSchema = Joi.object({ name: Joi.string().optional(), components: Joi.array().items(componentSchema).optional(), operations: Joi.array().items(operationSchema).optional() });

export async function list(req,res,next){ try { res.json({ items: await listBoms() }); } catch(e){ next(e);} }
export async function get(req,res,next){ try { const b = await getBom(req.params.id); if(!b) throw notFound('BOM'); res.json({ item: b }); } catch(e){ next(e);} }
export async function create(req,res,next){ try { const data = await createSchema.validateAsync(req.body); const b = await createBom(data); res.status(201).json({ item: b }); } catch(e){ next(e);} }
export async function update(req,res,next){ try { const data = await updateSchema.validateAsync(req.body); const b = await updateBom(req.params.id,data); if(!b) throw notFound('BOM'); res.json({ item: b }); } catch(e){ next(e);} }
export async function remove(req,res,next){ try { await deleteBom(req.params.id); res.json({ message: 'Deleted' }); } catch(e){ next(e);} }
