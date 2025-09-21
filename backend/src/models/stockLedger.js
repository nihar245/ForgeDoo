import { query } from '../config/db.js';

/**
 * Get stock summary - one row per product with calculated on_hand, incoming, outgoing
 * Returns: product_id, name, uom, unit_cost, on_hand, free_to_use, incoming, outgoing, total_value
 */
export async function getStockSummary() {
  const sql = `
    WITH movement_summary AS (
      SELECT 
        product_id,
        SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE 0 END) AS total_incoming,
        SUM(CASE WHEN movement_type = 'out' THEN quantity ELSE 0 END) AS total_outgoing
      FROM stock_ledger
      GROUP BY product_id
    )
    SELECT 
      p.id AS product_id,
      p.name,
      p.uom,
      COALESCE(p.unit_cost, 0) AS unit_cost,
      COALESCE(ms.total_incoming, 0) - COALESCE(ms.total_outgoing, 0) AS on_hand,
      COALESCE(ms.total_incoming, 0) - COALESCE(ms.total_outgoing, 0) AS free_to_use,
      COALESCE(ms.total_incoming, 0) AS incoming,
      COALESCE(ms.total_outgoing, 0) AS outgoing,
      (COALESCE(ms.total_incoming, 0) - COALESCE(ms.total_outgoing, 0)) * COALESCE(p.unit_cost, 0) AS total_value
    FROM products p
    LEFT JOIN movement_summary ms ON p.id = ms.product_id
    ORDER BY p.name ASC
  `;
  
  const result = await query(sql);
  return result.rows;
}

/**
 * Get all stock ledger entries with product details
 * Returns: id, product_id, product_name, movement_type, quantity, reference, created_at
 */
export async function getAllLedgerEntries({ product_id, movement_type, reference, limit = 100, offset = 0 }) {
  const clauses = [];
  const params = [];
  let paramCount = 1;
  
  if (product_id) {
    clauses.push(`sl.product_id = $${paramCount++}`);
    params.push(product_id);
  }
  
  if (movement_type) {
    clauses.push(`sl.movement_type = $${paramCount++}`);
    params.push(movement_type);
  }
  
  if (reference) {
    clauses.push(`sl.reference ILIKE $${paramCount++}`);
    params.push(`%${reference}%`);
  }
  
  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  
  const sql = `
    SELECT 
      sl.id,
      sl.product_id,
      p.name AS product_name,
      sl.movement_type,
      sl.quantity,
      sl.reference,
      sl.created_at
    FROM stock_ledger sl
    LEFT JOIN products p ON sl.product_id = p.id
    ${whereClause}
    ORDER BY sl.created_at DESC, sl.id DESC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;
  
  params.push(limit, offset);
  const result = await query(sql);
  return result.rows;
}

/**
 * Add a new stock movement entry
 * @param {Object} stockData - { product_id, movement_type, quantity, reference, unit_cost }
 * @returns {Object} - The created ledger entry with updated product summary
 */
export async function addStockMovement(stockData) {
  const { product_id, movement_type = 'in', quantity, reference, unit_cost } = stockData;
  
  // Update product unit cost if provided
  if (unit_cost !== undefined && unit_cost !== null) {
    await query(
      'UPDATE products SET unit_cost = $1 WHERE id = $2',
      [unit_cost, product_id]
    );
  }
  
  // Insert the stock movement
  const insertResult = await query(
    'INSERT INTO stock_ledger (product_id, movement_type, quantity, reference) VALUES ($1, $2, $3, $4) RETURNING *',
    [product_id, movement_type, quantity, reference || null]
  );
  
  // Get updated product summary
  const summary = await getProductStockSummary(product_id);
  
  return {
    ledger_entry: insertResult.rows[0],
    product_summary: summary
  };
}

/**
 * Get stock summary for a specific product
 * @param {number} product_id 
 * @returns {Object} - Stock summary for the product
 */
export async function getProductStockSummary(product_id) {
  const sql = `
    WITH movement_summary AS (
      SELECT 
        product_id,
        SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE 0 END) AS total_incoming,
        SUM(CASE WHEN movement_type = 'out' THEN quantity ELSE 0 END) AS total_outgoing
      FROM stock_ledger
      WHERE product_id = $1
      GROUP BY product_id
    )
    SELECT 
      p.id AS product_id,
      p.name,
      p.uom,
      COALESCE(p.unit_cost, 0) AS unit_cost,
      COALESCE(ms.total_incoming, 0) - COALESCE(ms.total_outgoing, 0) AS on_hand,
      COALESCE(ms.total_incoming, 0) - COALESCE(ms.total_outgoing, 0) AS free_to_use,
      COALESCE(ms.total_incoming, 0) AS incoming,
      COALESCE(ms.total_outgoing, 0) AS outgoing,
      (COALESCE(ms.total_incoming, 0) - COALESCE(ms.total_outgoing, 0)) * COALESCE(p.unit_cost, 0) AS total_value
    FROM products p
    LEFT JOIN movement_summary ms ON p.id = ms.product_id
    WHERE p.id = $1
  `;
  
  const result = await query(sql, [product_id]);
  return result.rows[0] || null;
}

/**
 * Get ledger entry by ID
 * @param {number} id 
 * @returns {Object|null} - The ledger entry or null if not found
 */
export async function getLedgerEntry(id) {
  const sql = `
    SELECT 
      sl.id,
      sl.product_id,
      p.name AS product_name,
      sl.movement_type,
      sl.quantity,
      sl.reference,
      sl.created_at
    FROM stock_ledger sl
    LEFT JOIN products p ON sl.product_id = p.id
    WHERE sl.id = $1
  `;
  
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

// Legacy function for backward compatibility
export async function listLedger(options = {}) {
  return getAllLedgerEntries(options);
}