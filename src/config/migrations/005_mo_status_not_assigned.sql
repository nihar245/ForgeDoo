-- Migration 005: Replace terminal MO status 'done' with 'not_assigned'
-- Corrected ordering: drop constraint first, then update data, then add new constraint.

-- 1. Drop existing status constraint (if present)
DO $$
DECLARE constraint_name text;
BEGIN
  SELECT con.constraint_name INTO constraint_name
  FROM information_schema.table_constraints con
  WHERE con.table_name='manufacturing_orders' AND con.constraint_type='CHECK' AND con.constraint_name LIKE '%status%';
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE manufacturing_orders DROP CONSTRAINT %I', constraint_name);
  END IF;
END$$;

-- 2. Update existing rows from done -> not_assigned (safe now that constraint gone)
UPDATE manufacturing_orders SET status='not_assigned' WHERE status='done';

-- 3. Add new constraint allowing not_assigned
ALTER TABLE manufacturing_orders
  ADD CONSTRAINT manufacturing_orders_status_check CHECK (status IN ('draft','confirmed','in_progress','to_close','not_assigned'));
