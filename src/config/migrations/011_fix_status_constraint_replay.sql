-- Migration 011: Make status constraint evolution idempotent for clean test DB replay.
-- Ensures that if base table still has legacy statuses ('planned','done','canceled') we transform them before final constraint.
DO $$
DECLARE existing_def text;
BEGIN
  -- Normalize legacy statuses before enforcing final constraint
  UPDATE manufacturing_orders SET status='draft' WHERE status IN ('planned','canceled');
  UPDATE manufacturing_orders SET status='not_assigned' WHERE status='done';

  SELECT pg_get_constraintdef(oid) INTO existing_def
  FROM pg_constraint
  WHERE conname = 'manufacturing_orders_status_check'
    AND conrelid = 'manufacturing_orders'::regclass;

  IF existing_def IS NULL OR existing_def NOT ILIKE '%cancelled%' THEN
    -- Drop then recreate final constraint
    EXECUTE 'ALTER TABLE manufacturing_orders DROP CONSTRAINT IF EXISTS manufacturing_orders_status_check';
    EXECUTE 'ALTER TABLE manufacturing_orders ADD CONSTRAINT manufacturing_orders_status_check CHECK (status IN (''draft'',''confirmed'',''in_progress'',''to_close'',''not_assigned'',''cancelled''))';
  END IF;
END;$$ LANGUAGE plpgsql;
