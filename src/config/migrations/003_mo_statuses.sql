-- Migration 003: Expand manufacturing_orders status values
-- New statuses: draft, confirmed, in_progress, to_close, done
-- 'late' will be computed dynamically (not stored) when end_date < current_date AND status NOT IN ('done','to_close','draft')

ALTER TABLE manufacturing_orders
  ALTER COLUMN status DROP DEFAULT;

-- Adjust constraint: drop existing then add new
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

-- Map previous statuses: planned->draft, canceled->draft BEFORE adding new constraint
UPDATE manufacturing_orders SET status='draft' WHERE status IN ('planned','canceled');

ALTER TABLE manufacturing_orders
  ADD CONSTRAINT manufacturing_orders_status_check CHECK (status IN ('draft','confirmed','in_progress','to_close','done'));
