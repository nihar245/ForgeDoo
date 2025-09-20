import Joi from 'joi';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../models/products.js';
import { cacheGet, cacheSet, cacheDel, isRedisReady } from '../core/redis.js';
import { config } from '../core/config.js';
import { badRequest, notFound } from '../core/apiError.js';

const productSchema = Joi.object({
  name: Joi.string().min(2).required(),
  // Accept simplified types and legacy values
  type: Joi.string().valid('raw','finished','raw_material','semi_finished').required(),
  uom: Joi.string().default('pcs'),
  unit_cost: Joi.number().precision(4).min(0).default(0),
  category: Joi.string().valid('raw_material','semi_finished','finished').optional(),
  is_component: Joi.boolean().optional()
}).custom((val, helpers)=>{
  // Map simplified to legacy
  const map = { raw: 'raw_material' };
  if(map[val.type]) val.type = map[val.type];
  return val;
});

export async function list(req, res, next) {
  try {
    const cacheKey = 'products:all';
    if (config.env !== 'test' && isRedisReady()) {
      const cached = await cacheGet(cacheKey);
      if (cached) return res.json({ items: cached, cached: true });
    }
    const items = await listProducts();
    if (config.env !== 'test' && isRedisReady()) {
      cacheSet(cacheKey, items, config.redis.ttlSec).catch(()=>{});
    }
    res.json({ items, cached: false });
  } catch(e){ next(e);} }
export async function get(req, res, next) { try { const p = await getProduct(req.params.id); if(!p) throw notFound('Product'); res.json({ item: p }); } catch(e){ next(e);} }
export async function create(req, res, next) { try { const data = await productSchema.validateAsync(req.body); const p = await createProduct(data); if(isRedisReady()) cacheDel('products:*'); res.status(201).json({ item: p }); } catch(e){ next(e);} }
export async function update(req, res, next) { try { const data = await productSchema.validateAsync(req.body); const p = await updateProduct(req.params.id, data); if(!p) throw notFound('Product'); if(isRedisReady()) cacheDel('products:*'); res.json({ item: p }); } catch(e){ next(e);} }
export async function remove(req, res, next) { try { await deleteProduct(req.params.id); if(isRedisReady()) cacheDel('products:*'); res.status(204).end(); } catch(e){ next(e);} }
