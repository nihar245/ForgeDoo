-- Migration 013: Add unit_cost to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(12,4);
-- Optionally initialize some default costs (set NULL costs to 0)
UPDATE products SET unit_cost = COALESCE(unit_cost,0);
