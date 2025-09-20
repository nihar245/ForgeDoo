import { query } from '../config/db.js';

export async function listBoms(){
  const r = await query('SELECT b.id,b.product_id,p.name as product_name,b.version,b.created_at FROM bom b JOIN products p ON p.id=b.product_id ORDER BY b.id');
  return r.rows;
}

export async function getBom(id){
  const bomR = await query('SELECT * FROM bom WHERE id=$1',[id]);
  if(!bomR.rowCount) return null;
  const components = await query('SELECT * FROM bom_components WHERE bom_id=$1 ORDER BY id',[id]);
  const ops = await query('SELECT * FROM bom_operations WHERE bom_id=$1 ORDER BY id',[id]);
  return { ...bomR.rows[0], components: components.rows, operations: ops.rows };
}

export async function createBom({product_id,version,name,components,operations}){
  const effectiveVersion = (version || name || 'v1').toString().slice(0,10);
  const r = await query('INSERT INTO bom(product_id,version,created_by) VALUES($1,$2,$3) RETURNING *',[product_id,effectiveVersion,1]);
  const bomId = r.rows[0].id;
  for(const c of components||[]){
    const qty = c.quantity ?? c.qty_per_unit; // support either field
    await query('INSERT INTO bom_components(bom_id,component_product_id,quantity) VALUES($1,$2,$3)',[bomId,c.component_product_id,qty]);
  }
  for(const o of operations||[]){
    const wcId = o.workcenter_id ?? o.work_center_id;
    await query('INSERT INTO bom_operations(bom_id,operation_name,workcenter_id,duration_mins) VALUES($1,$2,$3,$4)',[bomId,o.operation_name,wcId,o.duration_mins]);
  }
  return getBom(bomId);
}

export async function updateBom(id,{version,name,components,operations}){
  const effectiveVersion = (version || name);
  if(effectiveVersion) await query('UPDATE bom SET version=$2 WHERE id=$1',[id,effectiveVersion.toString().slice(0,10)]);
  if(components){
    await query('DELETE FROM bom_components WHERE bom_id=$1',[id]);
    for(const c of components){
      const qty = c.quantity ?? c.qty_per_unit;
      await query('INSERT INTO bom_components(bom_id,component_product_id,quantity) VALUES($1,$2,$3)',[id,c.component_product_id,qty]);
    }
  }
  if(operations){
    await query('DELETE FROM bom_operations WHERE bom_id=$1',[id]);
    for(const o of operations){
      const wcId = o.workcenter_id ?? o.work_center_id;
      await query('INSERT INTO bom_operations(bom_id,operation_name,workcenter_id,duration_mins) VALUES($1,$2,$3,$4)',[id,o.operation_name,wcId,o.duration_mins]);
    }
  }
  return getBom(id);
}

export async function deleteBom(id){
  await query('DELETE FROM bom WHERE id=$1',[id]);
}
