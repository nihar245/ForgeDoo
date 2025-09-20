-- 014_bom_output_quantity.sql
-- Adds output_quantity to bom (finished product quantity produced by the BOM)
-- Idempotent: safe to re-run.

ALTER TABLE bom
ADD COLUMN IF NOT EXISTS output_quantity DECIMAL(10,2) DEFAULT 1;

UPDATE bom SET output_quantity = 1 WHERE output_quantity IS NULL;

-- No down migration provided (forward-only migrations policy)