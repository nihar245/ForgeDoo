import { query } from '../config/db.js';

export async function listLedger({ product_id, movement_type, ref, limit=100, offset=0 }) {
  const clauses=[]; const params=[]; let i=1;
  if(product_id){ clauses.push(`product_id=$${i++}`); params.push(product_id); }
  if(movement_type){ clauses.push(`movement_type=$${i++}`); params.push(movement_type); }
  if(ref){ clauses.push(`reference ILIKE $${i++}`); params.push(`%${ref}%`); }
  const where = clauses.length? 'WHERE '+clauses.join(' AND '):'';
  const res = await query(`SELECT * FROM stock_ledger ${where} ORDER BY id DESC LIMIT $${i++} OFFSET $${i++}`,[...params, limit, offset]);
  return res.rows;
}

export async function getLedgerEntry(id){
  const res = await query('SELECT * FROM stock_ledger WHERE id=$1',[id]);
  return res.rows[0] || null;
}