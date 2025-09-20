import { query } from '../config/db.js';

export async function listProducts() {
  const res = await query('SELECT * FROM products ORDER BY id');
  return res.rows;
}

// Helper functions for unified product system
export async function listRawMaterials() {
  const res = await query('SELECT * FROM products WHERE category=\'raw_material\' OR is_component=true ORDER BY id');
  return res.rows;
}

export async function listFinishedProducts() {
  const res = await query('SELECT * FROM products WHERE category=\'finished\' OR is_component=false ORDER BY id');
  return res.rows;
}

export async function listByCategory(category) {
  const res = await query('SELECT * FROM products WHERE category=$1 ORDER BY id', [category]);
  return res.rows;
}
export async function getProduct(id) {
  const res = await query('SELECT * FROM products WHERE id=$1', [id]);
  return res.rows[0];
}
export async function createProduct({ name, type, uom, unit_cost, category, is_component}) {
  const effectiveCategory = category || (type === 'raw_material' ? 'raw_material' : 'finished');
  const effectiveIsComponent = is_component !== undefined ? is_component : (type === 'raw_material');
  const res = await query('INSERT INTO products(name,type,uom,unit_cost,category,is_component) VALUES($1,$2,$3,$4,$5,$6) RETURNING *', [name, type, uom, unit_cost, effectiveCategory, effectiveIsComponent]);
  return res.rows[0];
}
export async function updateProduct(id, { name, type, uom, unit_cost, category, is_component }) {
  const fields = [];
  const values = [id];
  let setClause = '';
  
  if(name !== undefined) {
    fields.push('name');
    values.push(name);
    setClause += 'name=$' + values.length;
  }
  if(type !== undefined) {
    if(setClause) setClause += ',';
    fields.push('type');
    values.push(type);
    setClause += 'type=$' + values.length;
  }
  if(uom !== undefined) {
    if(setClause) setClause += ',';
    fields.push('uom');
    values.push(uom);
    setClause += 'uom=$' + values.length;
  }
  if(unit_cost !== undefined) {
    if(setClause) setClause += ',';
    fields.push('unit_cost');
    values.push(unit_cost);
    setClause += 'unit_cost=$' + values.length;
  }
  if(category !== undefined) {
    if(setClause) setClause += ',';
    fields.push('category');
    values.push(category);
    setClause += 'category=$' + values.length;
  }
  if(is_component !== undefined) {
    if(setClause) setClause += ',';
    fields.push('is_component');
    values.push(is_component);
    setClause += 'is_component=$' + values.length;
  }
  
  const res = await query(`UPDATE products SET ${setClause} WHERE id=$1 RETURNING *`, values);
  return res.rows[0];
}
export async function deleteProduct(id) {
  await query('DELETE FROM products WHERE id=$1', [id]);
}
