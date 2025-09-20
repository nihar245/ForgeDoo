import { query } from '../config/db.js';

export async function getInventoryForProduct(productId){
  const res = await query('SELECT product_id, quantity_available, reorder_level, location, last_updated FROM inventory WHERE product_id=$1',[productId]);
  return res.rows[0] || { product_id: productId, quantity_available: 0 };
}

export async function listInventory(){
  const res = await query('SELECT i.product_id,p.name,p.sku,p.type,i.quantity_available,i.reorder_level,i.location,i.last_updated FROM inventory i JOIN products p ON p.id=i.product_id ORDER BY p.id');
  return res.rows;
}

export async function adjustInventory({ productId, quantity, movement_type, reference }){
  await query('INSERT INTO inventory(product_id) VALUES($1) ON CONFLICT DO NOTHING',[productId]);
  let delta = 0;
  if(movement_type==='in') delta = quantity; else if(movement_type==='out') delta = -quantity; else delta = quantity; // fallback
  const res = await query('UPDATE inventory SET quantity_available = quantity_available + $2, last_updated=NOW() WHERE product_id=$1 RETURNING *',[productId, delta]);
  await query('INSERT INTO stock_ledger(product_id, movement_type, quantity, reference) VALUES($1,$2,$3,$4)',[productId, movement_type, quantity, reference||null]);
  return res.rows[0];
}
