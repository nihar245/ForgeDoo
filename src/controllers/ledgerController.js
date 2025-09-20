import Joi from 'joi';
import { query } from '../config/db.js';
import { adjustInventory } from '../models/inventory.js';

// GET /ledger : stock summary (one row per product)
// Fields: product_id, sku, name, uom, unit_cost, on_hand, free_to_use (alias of on_hand for now), incoming, outgoing, total_value
export async function stockSummary(_req,res,next){
  try {
    const sql = `
      WITH mv AS (
        SELECT product_id,
               SUM(CASE WHEN movement_type='in' THEN quantity ELSE 0 END) AS incoming,
               SUM(CASE WHEN movement_type='out' THEN quantity ELSE 0 END) AS outgoing
        FROM stock_ledger
        GROUP BY product_id
      )
      SELECT p.id AS product_id, p.sku, p.name, p.uom, COALESCE(p.unit_cost,0) AS unit_cost,
             COALESCE(i.quantity_available,0) AS on_hand,
             COALESCE(i.quantity_available,0) AS free_to_use,
             COALESCE(mv.incoming,0) AS incoming,
             COALESCE(mv.outgoing,0) AS outgoing,
             (COALESCE(i.quantity_available,0) * COALESCE(p.unit_cost,0)) AS total_value
      FROM products p
      LEFT JOIN inventory i ON i.product_id = p.id
      LEFT JOIN mv ON mv.product_id = p.id
      ORDER BY p.id`;
    const r = await query(sql);
    res.json({ data: r.rows });
  } catch(e){ next(e); }
}

// POST /ledger/add : add stock (increase on-hand) or remove (if movement_type='out')
export const addStockSchema = Joi.object({
  product_name: Joi.string().optional(),
  product_id: Joi.number().integer().optional(),
  quantity: Joi.number().positive().required(),
  movement_type: Joi.string().valid('in','out').default('in'),
  unit_cost: Joi.number().precision(4).optional(),
  reference: Joi.string().optional()
}).xor('product_name','product_id');

export async function addStock(req,res,next){
  try {
    const { product_name, product_id, quantity, movement_type, unit_cost, reference } = await addStockSchema.validateAsync(req.body);
    let pid = product_id;
    if(product_name && !pid){
      const lookup = await query('SELECT id FROM products WHERE name=$1',[product_name]);
      if(!lookup.rowCount) return res.status(400).json({ error: 'Product not found' });
      pid = lookup.rows[0].id;
    }
    if(unit_cost !== undefined){
      await query('UPDATE products SET unit_cost=$2 WHERE id=$1',[pid, unit_cost]);
    }
    const inv = await adjustInventory({ productId: pid, quantity, movement_type, reference });
    // Return updated single product summary row
    const r = await query(`
      WITH mv AS (
        SELECT product_id,
               SUM(CASE WHEN movement_type='in' THEN quantity ELSE 0 END) AS incoming,
               SUM(CASE WHEN movement_type='out' THEN quantity ELSE 0 END) AS outgoing
        FROM stock_ledger WHERE product_id=$1 GROUP BY product_id
      )
      SELECT p.id AS product_id, p.sku, p.name, p.uom, COALESCE(p.unit_cost,0) AS unit_cost,
             COALESCE($2::numeric,0) + 0 AS last_quantity_change,
             COALESCE(i.quantity_available,0) AS on_hand,
             COALESCE(i.quantity_available,0) AS free_to_use,
             COALESCE(mv.incoming,0) AS incoming,
             COALESCE(mv.outgoing,0) AS outgoing,
             (COALESCE(i.quantity_available,0) * COALESCE(p.unit_cost,0)) AS total_value
      FROM products p
      LEFT JOIN inventory i ON i.product_id = p.id
      LEFT JOIN mv ON mv.product_id = p.id
      WHERE p.id=$1`,[pid, movement_type==='in'? quantity : -quantity]);
    res.status(201).json({ data: r.rows[0], inventory: inv });
  } catch(e){ next(e); }
}