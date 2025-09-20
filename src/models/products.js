import { query } from '../config/db.js';

export async function listProducts() {
  const res = await query('SELECT * FROM products ORDER BY id');
  return res.rows;
}
export async function getProduct(id) {
  const res = await query('SELECT * FROM products WHERE id=$1', [id]);
  return res.rows[0];
}
export async function createProduct({ sku, name, type, uom }) {
  const res = await query('INSERT INTO products(sku,name,type,uom) VALUES($1,$2,$3,$4) RETURNING *', [sku, name, type, uom]);
  return res.rows[0];
}
export async function updateProduct(id, { sku, name, type, uom }) {
  const res = await query('UPDATE products SET sku=$2,name=$3,type=$4,uom=$5 WHERE id=$1 RETURNING *', [id, sku, name, type, uom]);
  return res.rows[0];
}
export async function deleteProduct(id) {
  await query('DELETE FROM products WHERE id=$1', [id]);
}
