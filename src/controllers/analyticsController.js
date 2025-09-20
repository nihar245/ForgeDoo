import { query } from '../config/db.js';
import Joi from 'joi';

export async function dashboard(req,res,next){
  try {
    const kpiRes = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status='draft') AS draft,
        COUNT(*) FILTER (WHERE status='confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status='in_progress') AS in_progress,
        COUNT(*) FILTER (WHERE status='to_close') AS to_close,
  COUNT(*) FILTER (WHERE status='not_assigned') AS not_assigned
      FROM manufacturing_orders`);
    const woRes = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status='pending') AS wo_pending,
        COUNT(*) FILTER (WHERE status='in_progress') AS wo_in_progress,
        COUNT(*) FILTER (WHERE status='paused') AS wo_paused,
        COUNT(*) FILTER (WHERE status='done') AS wo_done
      FROM work_orders`);
    res.json({ data: { ...kpiRes.rows[0], ...woRes.rows[0] } });
  } catch(e){ next(e); }
}

const throughputSchema = Joi.object({ start: Joi.date().required(), end: Joi.date().required(), granularity: Joi.string().valid('day','week').default('day') });

export async function throughput(req,res,next){
  try {
    const { start, end, granularity } = await throughputSchema.validateAsync({ start: req.query.start, end: req.query.end, granularity: req.query.granularity });
    const dateTrunc = granularity === 'week' ? 'week' : 'day';
    const sql = `
      SELECT date_trunc('${dateTrunc}', end_date)::date AS period,
             COUNT(*) AS orders_completed
      FROM manufacturing_orders
  WHERE status='not_assigned' AND end_date BETWEEN $1::date AND $2::date
      GROUP BY 1
      ORDER BY 1`;
    const r = await query(sql,[start,end]);
    res.json({ data: r.rows });
  } catch(e){ next(e); }
}

export async function cycleTime(req,res,next){
  try {
    const { start, end } = await throughputSchema.validateAsync({ start: req.query.start, end: req.query.end });
    const r = await query(`
      SELECT product_id,
             AVG((end_date - start_date))::numeric AS avg_cycle_days
      FROM manufacturing_orders
  WHERE status='not_assigned' AND start_date IS NOT NULL AND end_date IS NOT NULL
        AND start_date >= $1::date AND end_date <= $2::date
      GROUP BY product_id
      ORDER BY product_id`,[start,end]);
    res.json({ data: r.rows });
  } catch(e){ next(e); }
}
