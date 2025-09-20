import { query } from '../config/db.js';

export async function listBoms(){
  const r = await query('SELECT b.id,b.product_id,p.name as product_name,b.version,b.output_quantity,b.created_at FROM bom b JOIN products p ON p.id=b.product_id ORDER BY b.id');
  return r.rows;
}

export async function getBom(id){
  const bomR = await query('SELECT *, output_quantity FROM bom WHERE id=$1',[id]);
  if(!bomR.rowCount) return null;
  const components = await query('SELECT * FROM bom_components WHERE bom_id=$1 ORDER BY id',[id]);
  const ops = await query('SELECT * FROM bom_operations WHERE bom_id=$1 ORDER BY id',[id]);
  return { ...bomR.rows[0], components: components.rows, operations: ops.rows };
}

export async function createBom({product_id,version,name,components,operations,output_quantity}){
  const effectiveVersion = (version || name || 'v1').toString().slice(0,10);
  const oq = output_quantity ?? 1;
  const r = await query('INSERT INTO bom(product_id,version,created_by,output_quantity) VALUES($1,$2,$3,$4) RETURNING *',[product_id,effectiveVersion,1,oq]);
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

export async function updateBom(id,{version,name,components,operations,output_quantity}){
  const effectiveVersion = (version || name);
  if(effectiveVersion) await query('UPDATE bom SET version=$2 WHERE id=$1',[id,effectiveVersion.toString().slice(0,10)]);
  if(output_quantity !== undefined) await query('UPDATE bom SET output_quantity=$2 WHERE id=$1',[id,output_quantity]);
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

// Upsert by product_id + (optional) version or name reference.
// If a BOM for product and version exists, we replace components/operations and update output_quantity.
export async function upsertBom({ product_id, name, version, components, operations, output_quantity }){
  const effectiveVersion = (version || name || 'v1').toString().slice(0,10);
  const existing = await query('SELECT id FROM bom WHERE product_id=$1 AND version=$2 ORDER BY id LIMIT 1',[product_id,effectiveVersion]);
  if(existing.rowCount){
    return updateBom(existing.rows[0].id,{ version: effectiveVersion, name: effectiveVersion, components, operations, output_quantity });
  }
  return createBom({ product_id, version: effectiveVersion, name: effectiveVersion, components, operations, output_quantity });
}
