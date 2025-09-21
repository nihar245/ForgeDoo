import { query } from '../config/db.js';
import { updateMOAggregatedStatus } from './manufacturingOrders.js';

function formatWO(id){ return `WO-${id.toString().padStart(6,'0')}`; }

export async function listWOs({ mo_id, status, assigned_to }){
  const clauses=[]; const params=[]; let i=1;
  if(mo_id){ clauses.push(`wo.mo_id=$${i++}`); params.push(mo_id); }
  if(status){ clauses.push(`wo.status=$${i++}`); params.push(status); }
  if(assigned_to){ clauses.push(`wo.assigned_to=$${i++}`); params.push(assigned_to); }
  const where = clauses.length? 'WHERE '+clauses.join(' AND '):'';
  
  const res = await query(`
    WITH bom_map AS (
      SELECT b.id AS bom_id, b.product_id FROM bom b
    )
    SELECT wo.id,
           wo.mo_id,
           wo.operation_name,
           wo.assigned_to,
           wo.status,
           wo.started_at,
           wo.ended_at,
           wo.real_duration_mins,
           u.name as assigned_to_name,
           mo.product_id,
           mo.quantity as mo_quantity,
           p.name as product_name,
           bo.duration_mins AS expected_duration_mins,
           wc.name AS work_center_name,
           wc.cost_per_hour
    FROM work_orders wo 
    LEFT JOIN users u ON wo.assigned_to = u.id
    LEFT JOIN manufacturing_orders mo ON wo.mo_id = mo.id
    LEFT JOIN products p ON mo.product_id = p.id
    LEFT JOIN bom_operations bo ON bo.bom_id = mo.bom_id AND bo.operation_name = wo.operation_name
    LEFT JOIN work_centers wc ON wc.id = bo.workcenter_id
    ${where} 
    ORDER BY wo.id ASC
  `, params);
  return res.rows.map(r=>({ ...r, reference: formatWO(r.id) }));
}

export async function createWO({ mo_id, operation_name, assigned_to, status }){
  const res = await query('INSERT INTO work_orders(mo_id, operation_name, assigned_to, status) VALUES($1,$2,$3,$4) RETURNING *',[mo_id, operation_name, assigned_to||null, status||'pending']);
  return { ...res.rows[0], reference: formatWO(res.rows[0].id) };
}

export async function getWO(id){
  const res = await query(`
    SELECT wo.id,
           wo.mo_id,
           wo.operation_name,
           wo.assigned_to,
           wo.status,
           wo.started_at,
           wo.ended_at,
           wo.real_duration_mins,
           u.name as assigned_to_name,
           mo.product_id,
           mo.quantity as mo_quantity,
           p.name as product_name,
           bo.duration_mins AS expected_duration_mins,
           wc.name AS work_center_name,
           wc.cost_per_hour
    FROM work_orders wo 
    LEFT JOIN users u ON wo.assigned_to = u.id
    LEFT JOIN manufacturing_orders mo ON wo.mo_id = mo.id
    LEFT JOIN products p ON mo.product_id = p.id
    LEFT JOIN bom_operations bo ON bo.bom_id = mo.bom_id AND bo.operation_name = wo.operation_name
    LEFT JOIN work_centers wc ON wc.id = bo.workcenter_id
    WHERE wo.id=$1
  `,[id]);
  if(!res.rowCount) return null; 
  return { ...res.rows[0], reference: formatWO(res.rows[0].id) };
}

export async function assignWO(id, assignee_id){
  const res = await query('UPDATE work_orders SET assigned_to=$2 WHERE id=$1 RETURNING *',[id, assignee_id]);
  if(!res.rowCount) return null; return { ...res.rows[0], reference: formatWO(res.rows[0].id) };
}

export async function startWO(id){
  const woRes = await query("UPDATE work_orders SET status=CASE WHEN status IN ('pending','paused') THEN 'in_progress' ELSE status END, started_at=COALESCE(started_at,NOW()) WHERE id=$1 RETURNING *",[id]);
  if(!woRes.rowCount) return null;
  await updateMOAggregatedStatus(woRes.rows[0].mo_id);
  return { ...woRes.rows[0], reference: formatWO(woRes.rows[0].id) };
}

export async function pauseWO(id){
  const woRes = await query("UPDATE work_orders SET status=CASE WHEN status='in_progress' THEN 'paused' ELSE status END WHERE id=$1 RETURNING *",[id]);
  if(!woRes.rowCount) return null; await updateMOAggregatedStatus(woRes.rows[0].mo_id); return { ...woRes.rows[0], reference: formatWO(woRes.rows[0].id) };
}

export async function resumeWO(id){
  return startWO(id);
}

export async function completeWO(id){
  const woRes = await query("UPDATE work_orders SET status=CASE WHEN status IN ('in_progress','paused') THEN 'done' ELSE status END, ended_at=NOW(), real_duration_mins = CASE WHEN started_at IS NOT NULL THEN EXTRACT(EPOCH FROM (NOW() - started_at))/60.0 ELSE real_duration_mins END WHERE id=$1 RETURNING *",[id]);
  if(!woRes.rowCount) return null; await updateMOAggregatedStatus(woRes.rows[0].mo_id); return { ...woRes.rows[0], reference: formatWO(woRes.rows[0].id) };
}

export async function commentWO(id, comment){
  const sql = `UPDATE work_orders SET operation_name=operation_name WHERE id=$1 RETURNING *`; // placeholder (no comments column now)
  const woRes = await query(sql,[id]);
  if(!woRes.rowCount) return null; return { ...woRes.rows[0], reference: formatWO(woRes.rows[0].id) };
}

export async function updateWO(id,{ operation_name, status }){
  const res = await query('UPDATE work_orders SET operation_name=COALESCE($2,operation_name), status=COALESCE($3,status) WHERE id=$1 RETURNING *',[id, operation_name, status]);
  if(!res.rowCount) return null; await updateMOAggregatedStatus(res.rows[0].mo_id); return { ...res.rows[0], reference: formatWO(res.rows[0].id) };
}

// Generate missing work orders for a given MO based on its BOM operations
// Returns { inserted: number, status: string }
export async function generateMissingWOs(mo_id){
  // Get MO + BOM
  const moRes = await query('SELECT id, bom_id FROM manufacturing_orders WHERE id=$1',[mo_id]);
  if(!moRes.rowCount) return { inserted: 0, status: 'mo_not_found' };
  const mo = moRes.rows[0];
  if(!mo.bom_id) return { inserted: 0, status: 'no_bom' };

  // Check operations
  const opsRes = await query('SELECT id FROM bom_operations WHERE bom_id=$1',[mo.bom_id]);
  if(!opsRes.rowCount) return { inserted: 0, status: 'no_operations' };

  // Insert missing operations
  const insertRes = await query(`
    INSERT INTO work_orders (mo_id, operation_name, status)
    SELECT $1, bo.operation_name, 'pending'
    FROM bom_operations bo
    LEFT JOIN work_orders w ON w.mo_id = $1 AND w.operation_name = bo.operation_name
    WHERE bo.bom_id = $2 AND w.id IS NULL
    RETURNING id`,[mo_id, mo.bom_id]);

  if(insertRes.rowCount){
    await updateMOAggregatedStatus(mo_id);
    return { inserted: insertRes.rowCount, status: 'inserted' };
  }
  return { inserted: 0, status: 'already_exists' };
}
