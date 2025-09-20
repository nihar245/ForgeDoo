import { query } from '../config/db.js';
import { updateMOAggregatedStatus } from './manufacturingOrders.js';

function formatWO(id){ return `WO-${id.toString().padStart(6,'0')}`; }

export async function listWOs({ mo_id, status, work_center_id }){
  const clauses=[]; const params=[]; let i=1;
  if(mo_id){ clauses.push(`wo.mo_id=$${i++}`); params.push(mo_id); }
  if(status){ clauses.push(`wo.status=$${i++}`); params.push(status); }
  if(work_center_id){ clauses.push(`wo.work_center_id=$${i++}`); params.push(work_center_id); }
  const where = clauses.length? 'WHERE '+clauses.join(' AND '):'';
  const res = await query(`
    SELECT wo.*, wc.name as work_center_name, bo.operation_name as bom_operation_name
    FROM work_orders wo 
    LEFT JOIN work_centers wc ON wo.work_center_id = wc.id
    LEFT JOIN bom_operations bo ON wo.bom_operation_id = bo.id
    ${where} 
    ORDER BY wo.sequence ASC, wo.id ASC
  `, params);
  return res.rows.map(r=>({ ...r, reference: formatWO(r.id) }));
}

export async function createWO({ mo_id, bom_operation_id, operation_name, sequence, work_center_id, assigned_to, status, expected_duration_mins }){
  const res = await query('INSERT INTO work_orders(mo_id, bom_operation_id, operation_name, sequence, work_center_id, assigned_to, status, expected_duration_mins) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[mo_id, bom_operation_id, operation_name, sequence, work_center_id, assigned_to||null, status||'pending', expected_duration_mins]);
  return { ...res.rows[0], reference: formatWO(res.rows[0].id) };
}

export async function getWO(id){
  const res = await query(`
    SELECT wo.*, wc.name as work_center_name, bo.operation_name as bom_operation_name
    FROM work_orders wo 
    LEFT JOIN work_centers wc ON wo.work_center_id = wc.id
    LEFT JOIN bom_operations bo ON wo.bom_operation_id = bo.id
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
