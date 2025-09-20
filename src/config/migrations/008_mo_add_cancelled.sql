DO $$
DECLARE
  existing_def text;
BEGIN
  -- Fetch current definition (if any) of the known constraint name
  SELECT pg_get_constraintdef(oid) INTO existing_def
  FROM pg_constraint
  WHERE conname = 'manufacturing_orders_status_check'
    AND conrelid = 'manufacturing_orders'::regclass;

  IF existing_def IS NOT NULL AND existing_def ILIKE '%cancelled%' THEN
    RAISE NOTICE 'manufacturing_orders_status_check already contains cancelled; skipping';
    RETURN;
  END IF;

  -- Drop existing constraint (old definition) if present
  EXECUTE 'ALTER TABLE manufacturing_orders DROP CONSTRAINT IF EXISTS manufacturing_orders_status_check';

  -- Recreate with updated allowed statuses
  EXECUTE 'ALTER TABLE manufacturing_orders
    ADD CONSTRAINT manufacturing_orders_status_check CHECK (status IN (''draft'',''confirmed'',''in_progress'',''to_close'',''not_assigned'',''cancelled''))';
END;
$$ LANGUAGE plpgsql;