-- Migration 009: Add 'cancelled' to work_orders status domain
DO $$
DECLARE constraint_name text;
BEGIN
  SELECT con.constraint_name INTO constraint_name
  FROM information_schema.table_constraints con
  WHERE con.table_name='work_orders' AND con.constraint_type='CHECK' AND con.constraint_name LIKE '%status%';
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE work_orders DROP CONSTRAINT %I', constraint_name);
  END IF;
END$$;

ALTER TABLE work_orders
  ADD CONSTRAINT work_orders_status_check CHECK (status IN ('pending','in_progress','paused','done','cancelled'));