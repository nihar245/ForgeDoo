import { query } from '../config/db.js';
import Joi from 'joi';

const rangeSchema = Joi.object({ start: Joi.date().required(), end: Joi.date().required() });

export async function throughputReport(req,res,next){
  try {
    const { start, end } = await rangeSchema.validateAsync({ start: req.query.start, end: req.query.end });
    const r = await query(`
      SELECT end_date AS date, COUNT(*) AS orders_completed
      FROM manufacturing_orders
  WHERE status='not_assigned' AND end_date BETWEEN $1::date AND $2::date
      GROUP BY end_date
      ORDER BY end_date`,[start,end]);
    res.json({ data: r.rows });
  } catch(e){ next(e); }
}

export async function userWorkSummary(req,res,next){
  try {
    const r = await query(`
      SELECT u.id as user_id, u.name,
             COUNT(w.id) FILTER (WHERE w.status='done') AS work_orders_done,
             COUNT(w.id) FILTER (WHERE w.status='in_progress') AS work_orders_in_progress,
             COUNT(w.id) AS total_work_orders
      FROM users u
      LEFT JOIN work_orders w ON w.assigned_to = u.id
      GROUP BY u.id
      ORDER BY u.id`);
    res.json({ data: r.rows });
  } catch(e){ next(e); }
}

export async function inventorySummary(req,res,next){
  try {
    const r = await query(`
      SELECT p.id as product_id, p.sku, p.name, p.type, i.quantity_available, i.reorder_level, i.location
      FROM products p
      LEFT JOIN inventory i ON i.product_id = p.id
      ORDER BY p.id`);
    res.json({ data: r.rows });
  } catch(e){ next(e); }
}
