import { query } from '../config/db.js';
import { getBom } from './boms.js';

function formatMo(id){ return `MO-${id.toString().padStart(6,'0')}`; }

function computeLate(record){
  if(!record.end_date) return false;
  const end = new Date(record.end_date);
  const today = new Date();
  if(['done','cancelled'].includes(record.status)) return false;
  return end < new Date(today.toISOString().slice(0,10));
}

export async function listMOs({ status, product, created_by }){
  const clauses=[]; const params=[]; let i=1;
  if(status){ clauses.push(`status=$${i++}`); params.push(status); }
  if(product){ clauses.push(`product_id=$${i++}`); params.push(product); }
  if(created_by){ clauses.push(`created_by=$${i++}`); params.push(created_by); }
  const where = clauses.length? 'WHERE '+clauses.join(' AND '):'';
  const res = await query(`SELECT * FROM manufacturing_orders ${where} ORDER BY id DESC`, params);
  return res.rows.map(r=>({ ...r, reference: formatMo(r.id), is_late: computeLate(r), is_unassigned: !r.assignee_id }));
}

// List late manufacturing orders. Late = end_date < today AND status not terminal or in to_close.
export async function listLateMOs({ created_by } = {}){
  const params=[]; let i=1; let filter='';
  if(created_by){ filter = `AND created_by=$${i++}`; params.push(created_by); }
  const res = await query(`SELECT * FROM manufacturing_orders 
    WHERE end_date IS NOT NULL
      AND end_date < CURRENT_DATE
      AND status NOT IN ('not_assigned','to_close')
      ${filter}
    ORDER BY end_date ASC` , params);
  return res.rows.map(r=>({ ...r, reference: formatMo(r.id), is_late: computeLate(r) }));
}

export async function getMO(id){
  const res = await query('SELECT * FROM manufacturing_orders WHERE id=$1',[id]);
  if(!res.rowCount) return null;
  const r = res.rows[0];
  return { ...r, reference: formatMo(r.id), is_late: computeLate(r), is_unassigned: !r.assignee_id };
}

export async function createMO({ product_id, quantity, start_date, end_date, created_by, assignee_id, bom_id }){
  const res = await query('INSERT INTO manufacturing_orders(product_id, quantity, created_by, status, start_date, end_date, assignee_id, bom_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[product_id, quantity, created_by||1, 'draft', start_date||null, end_date||null, assignee_id||null, bom_id||null]);
  const r = res.rows[0];
  return { ...r, reference: formatMo(r.id), is_late: computeLate(r), is_unassigned: !r.assignee_id };
}

export async function updateMO(id, { quantity, start_date, end_date, status, assignee_id }){
  const res = await query('UPDATE manufacturing_orders SET quantity=COALESCE($2,quantity), start_date=COALESCE($3,start_date), end_date=COALESCE($4,end_date), status=COALESCE($5,status), assignee_id=COALESCE($6,assignee_id) WHERE id=$1 RETURNING *',[id, quantity, start_date, end_date, status, assignee_id]);
  if(!res.rowCount) return null; const r = res.rows[0]; return { ...r, reference: formatMo(r.id), is_late: computeLate(r), is_unassigned: !r.assignee_id };
}

export async function attachBOM(id, bom_id){
  // Only allow while planned or in_progress? For now planned only.
  const moRes = await query('SELECT status FROM manufacturing_orders WHERE id=$1',[id]);
  if(!moRes.rowCount) return null;
  if(moRes.rows[0].status !== 'draft') return null; // updated to match new lifecycle terminology
  const res = await query('UPDATE manufacturing_orders SET bom_id=$2 WHERE id=$1 RETURNING *',[id,bom_id]);
  if(!res.rowCount) return null; return { ...res.rows[0], reference: formatMo(res.rows[0].id) };
}

export async function setMOStatus(id, status){
  const res = await query('UPDATE manufacturing_orders SET status=$2 WHERE id=$1 RETURNING *',[id,status]);
  if(!res.rowCount) return null; const r = res.rows[0]; return { ...r, reference: formatMo(r.id), is_late: computeLate(r), is_unassigned: !r.assignee_id };
}

// Component availability & reservation logic
async function getEffectiveBOM(product_id, explicitBomId){
  // reuse logic similar to costing (latest bom if not explicit)
  const sql = `SELECT b.* FROM bom b
               WHERE b.id = $2 OR b.product_id = $1
               ORDER BY (b.id = $2) DESC, b.created_at DESC, b.id DESC
               LIMIT 1`;
  const r = await query(sql,[product_id, explicitBomId||0]);
  if(!r.rowCount) return null;
  const bomId = r.rows[0].id;
  const comps = await query('SELECT component_product_id, quantity FROM bom_components WHERE bom_id=$1',[bomId]);
  return { id: bomId, components: comps.rows };
}

export async function checkAndReserveComponents(mo_id){
  // Within a transaction: verify inventory then decrement & ledger
  const client = await (await import('../config/db.js')).pool.connect();
  try {
    await client.query('BEGIN');
    const moRes = await client.query('SELECT id, product_id, quantity, bom_id FROM manufacturing_orders WHERE id=$1 FOR UPDATE',[mo_id]);
    if(!moRes.rowCount) { await client.query('ROLLBACK'); return { status: 'not_available', reason: 'MO not found' }; }
    const mo = moRes.rows[0];
    const bom = await getEffectiveBOM(mo.product_id, mo.bom_id);
    if(!bom || bom.components.length===0){
      // No components required => trivially available
      await client.query('UPDATE manufacturing_orders SET component_status=$2 WHERE id=$1',[mo_id,'available']);
      await client.query('COMMIT');
      return { status: 'available', reserved: [] };
    }
    // Compute required quantities
    const requirements = bom.components.map(c=>({ product_id: c.component_product_id, required: Number(c.quantity)* mo.quantity }));
    // Lock inventory rows
    for(const req of requirements){
      await client.query('SELECT product_id FROM inventory WHERE product_id=$1 FOR UPDATE',[req.product_id]);
    }
    // Check availability
    for(const req of requirements){
      const inv = await client.query('SELECT quantity_available FROM inventory WHERE product_id=$1',[req.product_id]);
      const available = inv.rowCount? Number(inv.rows[0].quantity_available):0;
      if(available < req.required){
        await client.query('UPDATE manufacturing_orders SET component_status=$2 WHERE id=$1',[mo_id,'not_available']);
        await client.query('COMMIT');
        return { status: 'not_available', lacking: req.product_id };
      }
    }
    // Reserve (deduct) inventory and add ledger entries
    const reference = `MO-${mo.id}-RESERVE`;
    for(const req of requirements){
      await client.query('UPDATE inventory SET quantity_available = quantity_available - $2, last_updated=NOW() WHERE product_id=$1',[req.product_id, req.required]);
      await client.query('INSERT INTO stock_ledger(product_id, movement_type, quantity, reference) VALUES($1, $2, $3, $4)',[req.product_id,'out',req.required,reference]);
    }
    await client.query('UPDATE manufacturing_orders SET component_status=$2 WHERE id=$1',[mo_id,'available']);
    await client.query('COMMIT');
    return { status: 'available', reserved: requirements };
  } catch(e){
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Compute required components & availability for an MO without reserving
export async function computeComponentsAvailability(mo_id){
  const moRes = await query('SELECT id, product_id, quantity, bom_id FROM manufacturing_orders WHERE id=$1',[mo_id]);
  if(!moRes.rowCount) return null;
  const mo = moRes.rows[0];
  const bom = await getEffectiveBOM(mo.product_id, mo.bom_id);
  if(!bom || bom.components.length===0){
    return { mo_id: mo.id, reference: formatMo(mo.id), components: [] };
  }
  const rows = [];
  for(const c of bom.components){
    const required = Number(c.quantity) * mo.quantity;
    const inv = await query('SELECT quantity_available FROM inventory WHERE product_id=$1',[c.component_product_id]);
    const available = inv.rowCount? Number(inv.rows[0].quantity_available):0;
    rows.push({
      component_product_id: c.component_product_id,
      required,
      available,
      status: available >= required ? 'sufficient' : 'insufficient'
    });
  }
  return { mo_id: mo.id, reference: formatMo(mo.id), components: rows };
}

export async function deleteMO(id){
  const res = await query("DELETE FROM manufacturing_orders WHERE id=$1 AND status IN ('draft') RETURNING id",[id]);
  return res.rowCount>0;
}

export async function updateMOAggregatedStatus(mo_id){
  // Determine MO status from its work orders if MO not Cancelled
  const moRes = await query('SELECT status FROM manufacturing_orders WHERE id=$1',[mo_id]);
  if(!moRes.rowCount) return;
  const current = moRes.rows[0].status;
  const wos = await query('SELECT status FROM work_orders WHERE mo_id=$1',[mo_id]);
  if(wos.rowCount===0) return;
  const statuses = wos.rows.map(r=>r.status);
  let newStatus = current;
  if(statuses.some(s=>s==='cancelled')) newStatus = 'cancelled';
  else if(statuses.every(s=>s==='done')) newStatus = 'done';
  else if(statuses.some(s=>s==='in_progress' || s==='paused')) newStatus = 'in_progress';
  else if(statuses.every(s=>s==='pending')) newStatus = 'confirmed';
  if(newStatus !== current){
    await query('UPDATE manufacturing_orders SET status=$2 WHERE id=$1',[mo_id,newStatus]);
  }
}

// ------------------------------------------------------------
// Costing Logic
// Calculates cost per work order for an MO by mapping WO operation_name
// to the latest BOM (by created_at then id) for the MO's product. Uses
// work_centers.cost_per_hour. Duration derived from started_at/ended_at.
// ------------------------------------------------------------
export async function getMOCost(mo_id){
  const moRes = await query('SELECT * FROM manufacturing_orders WHERE id=$1',[mo_id]);
  if(!moRes.rowCount) return null;
  const mo = moRes.rows[0];
  // Fetch cost rows
  const costRowsRes = await query(`
    WITH latest_bom AS (
      SELECT b.* FROM bom b
      WHERE b.id = $3 OR b.product_id = $1
      ORDER BY (b.id = $3) DESC, b.created_at DESC, b.id DESC
      LIMIT 1
    ), op_map AS (
      SELECT bo.operation_name, bo.workcenter_id
      FROM bom_operations bo
      JOIN latest_bom lb ON bo.bom_id = lb.id
    ), wo AS (
      SELECT * FROM work_orders WHERE mo_id=$2
    )
    SELECT 
      w.id AS work_order_id,
      w.operation_name,
      EXTRACT(EPOCH FROM (
        CASE WHEN w.started_at IS NOT NULL 
          THEN COALESCE(w.ended_at, NOW()) - w.started_at 
          ELSE INTERVAL '0 minute' END))/60.0 AS duration_mins,
      op_map.workcenter_id,
      wc.cost_per_hour
    FROM wo w
    LEFT JOIN op_map ON op_map.operation_name = w.operation_name
    LEFT JOIN work_centers wc ON wc.id = op_map.workcenter_id
    ORDER BY w.id ASC
  `,[mo.product_id, mo_id, mo.bom_id || 0]);

  const breakdown = costRowsRes.rows.map(r=>{
    const durationHours = (r.duration_mins || 0)/60.0;
    const costPerHour = r.cost_per_hour ? Number(r.cost_per_hour) : 0;
    const cost = durationHours * costPerHour;
    return {
      work_order_id: r.work_order_id,
      operation_name: r.operation_name,
      duration_mins: Number(r.duration_mins||0).toFixed(2),
      workcenter_id: r.workcenter_id,
      cost_per_hour: costPerHour,
      cost: Number(cost.toFixed(2))
    };
  });
  const total_cost = breakdown.reduce((s,r)=>s + r.cost,0);
  return {
    mo_id: mo.id,
    reference: formatMo(mo.id),
    product_id: mo.product_id,
    total_cost: Number(total_cost.toFixed(2)),
    currency: 'USD', // Assumption; no currency table yet
    work_orders: breakdown
  };
}
