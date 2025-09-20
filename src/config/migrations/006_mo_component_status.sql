-- Migration 006: Add component_status to manufacturing_orders
-- Values: 'available','not_available'; NULL for historical rows until confirmed after this migration.

ALTER TABLE manufacturing_orders
  ADD COLUMN IF NOT EXISTS component_status VARCHAR(20) NULL;

-- Add / replace constraint to restrict values if not null
DO $$
DECLARE constraint_name text;
BEGIN
  SELECT con.constraint_name INTO constraint_name
  FROM information_schema.table_constraints con
  WHERE con.table_name='manufacturing_orders' AND con.constraint_type='CHECK' AND con.constraint_name LIKE '%component_status%';
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE manufacturing_orders DROP CONSTRAINT %I', constraint_name);
  END IF;
END$$;

ALTER TABLE manufacturing_orders
  ADD CONSTRAINT manufacturing_orders_component_status_check CHECK (component_status IS NULL OR component_status IN ('available','not_available'));

-- Existing rows remain NULL.