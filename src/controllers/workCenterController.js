import Joi from 'joi';
import { listWorkCenters, getWorkCenter, createWorkCenter, updateWorkCenter, deleteWorkCenter, getWorkCenterUtilization, upsertWorkCenter } from '../models/workCenters.js';
import { notFound } from '../core/apiError.js';

const schema = Joi.object({
	name: Joi.string().required(),
	cost_per_hour: Joi.number().positive().required(),
	capacity_per_hour: Joi.number().integer().min(1).default(1),
	location: Joi.string().allow('',null)
});
const utilizationSchema = Joi.object({ start: Joi.date().required(), end: Joi.date().required() });
const upsertSchema = Joi.object({
	name: Joi.string().required(),
	cost_per_hour: Joi.number().positive().required(),
	capacity_per_hour: Joi.number().integer().min(1).default(1),
	location: Joi.string().allow('',null)
});

export async function list(req,res,next){ try { res.json({ items: await listWorkCenters() }); } catch(e){ next(e);} }
export async function get(req,res,next){ try { const wc = await getWorkCenter(req.params.id); if(!wc) throw notFound('Work center'); res.json({ item: wc }); } catch(e){ next(e);} }
export async function create(req,res,next){ try { const data = await schema.validateAsync(req.body); const wc = await createWorkCenter(data); res.status(201).json({ item: wc }); } catch(e){ next(e);} }
export async function update(req,res,next){ try { const data = await schema.validateAsync(req.body); const wc = await updateWorkCenter(req.params.id,data); if(!wc) throw notFound('Work center'); res.json({ item: wc }); } catch(e){ next(e);} }
export async function remove(req,res,next){ try { await deleteWorkCenter(req.params.id); res.json({ message: 'Deleted' }); } catch(e){ next(e);} }

export async function utilization(req,res,next){
	try {
		const { start, end } = await utilizationSchema.validateAsync({ start: req.query.start, end: req.query.end });
		const data = await getWorkCenterUtilization({ start, end });
		res.json({ data });
	} catch(e){ next(e); }
}

export async function upsert(req,res,next){
	try {
		const data = await upsertSchema.validateAsync(req.body);
		const wc = await upsertWorkCenter(data);
		res.status(201).json({ item: wc });
	} catch(e){ next(e); }
}

export async function listCosts(_req,res,next){
	try {
		const rows = await listWorkCenters();
		res.json({ data: rows.map(r=>({ id: r.id, name: r.name, cost_per_hour: r.cost_per_hour, capacity_per_hour: r.capacity_per_hour })) });
	} catch(e){ next(e); }
}
