import { query } from '../config/db.js';

// Schema columns: name, capacity_per_hour, cost_per_hour, location
export async function listWorkCenters(){ const r = await query('SELECT * FROM work_centers ORDER BY id'); return r.rows; }
export async function getWorkCenter(id){ const r = await query('SELECT * FROM work_centers WHERE id=$1',[id]); return r.rows[0]; }
export async function createWorkCenter({name,cost_per_hour,capacity_per_hour,location}){ const r = await query('INSERT INTO work_centers(name,capacity_per_hour,cost_per_hour,location) VALUES($1,$2,$3,$4) RETURNING *',[name,capacity_per_hour, cost_per_hour, location]); return r.rows[0]; }
export async function updateWorkCenter(id,{name,cost_per_hour,capacity_per_hour,location}){ const r = await query('UPDATE work_centers SET name=$2, capacity_per_hour=$3, cost_per_hour=$4, location=$5 WHERE id=$1 RETURNING *',[id,name,capacity_per_hour,cost_per_hour,location]); return r.rows[0]; }
export async function deleteWorkCenter(id){ await query('DELETE FROM work_centers WHERE id=$1',[id]); }

// Upsert by name: if a work center with the given name exists, update cost/capacity/location; else insert
export async function upsertWorkCenter({ name, cost_per_hour, capacity_per_hour, location }){
	const existing = await query('SELECT id FROM work_centers WHERE name=$1 LIMIT 1',[name]);
	if(existing.rowCount){
		const r = await query('UPDATE work_centers SET capacity_per_hour=$2, cost_per_hour=$3, location=$4 WHERE id=$1 RETURNING *',[existing.rows[0].id, capacity_per_hour, cost_per_hour, location]);
		return r.rows[0];
	}
	const r = await query('INSERT INTO work_centers(name, capacity_per_hour, cost_per_hour, location) VALUES($1,$2,$3,$4) RETURNING *',[name, capacity_per_hour, cost_per_hour, location]);
	return r.rows[0];
}

// Utilization: compute total active minutes (from started_at to ended_at/now) for WOs mapped via BOM operations to work center.
export async function getWorkCenterUtilization({ start, end }){
	// start/end are dates; we consider WO started_at within window or overlapping
	const res = await query(`
		WITH wo_durations AS (
			SELECT w.id, w.operation_name, w.started_at, COALESCE(w.ended_at, NOW()) AS end_time, 
						 GREATEST(w.started_at, $1::timestamp) AS eff_start,
						 LEAST(COALESCE(w.ended_at, NOW()), $2::timestamp) AS eff_end,
						 w.mo_id
			FROM work_orders w
			WHERE w.started_at IS NOT NULL AND w.started_at <= $2::timestamp AND COALESCE(w.ended_at, NOW()) >= $1::timestamp
		), mapped AS (
			SELECT wd.*, bo.workcenter_id
			FROM wo_durations wd
			LEFT JOIN manufacturing_orders mo ON mo.id = wd.mo_id
			LEFT JOIN bom b ON b.product_id = mo.product_id
			LEFT JOIN bom_operations bo ON bo.bom_id = b.id AND bo.operation_name = wd.operation_name
		)
		SELECT wc.id as work_center_id, wc.name, wc.capacity_per_hour, wc.cost_per_hour,
					 SUM(EXTRACT(EPOCH FROM (eff_end - eff_start))/60.0) AS active_minutes
		FROM mapped m
		JOIN work_centers wc ON wc.id = m.workcenter_id
		GROUP BY wc.id
		ORDER BY wc.id
	`,[start, end]);

	return res.rows.map(r=>{
		const hoursCapacityWindow = ( (new Date(end) - new Date(start)) / 3600000 ) * (r.capacity_per_hour || 0);
		const activeMinutes = Number(r.active_minutes||0);
		const utilizationPercent = hoursCapacityWindow>0 ? (activeMinutes/60.0)/ (hoursCapacityWindow/(r.capacity_per_hour||1)) * 100 : 0;
		return {
			work_center_id: r.work_center_id,
			name: r.name,
			capacity_per_hour: r.capacity_per_hour,
			cost_per_hour: Number(r.cost_per_hour||0),
			active_minutes: Number(activeMinutes.toFixed(2)),
			utilization_percent: Number(utilizationPercent.toFixed(2))
		};
	});
}
