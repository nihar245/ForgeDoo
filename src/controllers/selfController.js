import { query } from '../config/db.js';

export async function myProfile(req,res,next){
  try {
    const userId = req.user.id;
    const userRes = await query('SELECT id,name,email,role,created_at FROM users WHERE id=$1',[userId]);
    if(!userRes.rowCount) return res.status(404).json({ error: 'User not found' });
    const statsRes = await query(`SELECT 
        (SELECT COUNT(*) FROM manufacturing_orders WHERE created_by=$1) AS mos_created,
        (SELECT COUNT(*) FROM work_orders WHERE assigned_to=$1) AS work_orders_total,
        (SELECT COUNT(*) FROM work_orders WHERE assigned_to=$1 AND status='done') AS work_orders_done,
        (SELECT COUNT(*) FROM work_orders WHERE assigned_to=$1 AND status='in_progress') AS work_orders_in_progress
      `,[userId]);
    const u = userRes.rows[0];
    res.json({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      created_at: u.created_at,
      stats: statsRes.rows[0]
    });
  } catch(e){ next(e); }
}

export async function myWorkOrdersReport(req,res,next){
  try {
    const userId = req.user.id;
    // Real duration if stored; expected duration from bom_operations via bom + operation name match
    const r = await query(`
      WITH wo AS (
        SELECT w.*, mo.product_id, mo.quantity AS mo_quantity, mo.bom_id
        FROM work_orders w
        JOIN manufacturing_orders mo ON mo.id = w.mo_id
        WHERE w.assigned_to = $1
      ), effective_bom AS (
        SELECT b.id AS bom_id, b.product_id
        FROM bom b
      )
      SELECT 
        w.id AS work_order_id,
        w.operation_name,
        w.status,
        w.product_id,
        w.mo_quantity,
        p.sku AS product_sku,
        p.name AS product_name,
        w.started_at,
        w.ended_at,
        w.real_duration_mins,
        bo.duration_mins AS expected_duration_mins,
        bo.workcenter_id,
        wc.name AS workcenter_name
      FROM wo w
      LEFT JOIN bom_operations bo ON (bo.bom_id = COALESCE(w.bom_id, bo.bom_id) AND bo.operation_name = w.operation_name)
      LEFT JOIN work_centers wc ON wc.id = bo.workcenter_id
      LEFT JOIN products p ON p.id = w.product_id
      ORDER BY w.id DESC
    `,[userId]);
    res.json({ data: r.rows.map(row => ({
      work_order_id: row.work_order_id,
      operation: row.operation_name,
      work_center: row.workcenter_name || null,
      work_center_id: row.workcenter_id || null,
      product_id: row.product_id,
      product_sku: row.product_sku,
      product_name: row.product_name,
      quantity: row.mo_quantity,
      expected_duration_mins: row.expected_duration_mins,
      real_duration_mins: row.real_duration_mins,
      status: row.status
    })) });
  } catch(e){ next(e); }
}
