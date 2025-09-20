-- Migration 012: Simplify MO statuses to (draft,confirmed,in_progress,done,cancelled)
-- Assumes old data can be discarded; forcibly normalizes any legacy statuses.
DO $$
BEGIN
  -- Normalize any legacy states directly to new canonical ones
  UPDATE manufacturing_orders SET status='draft' WHERE status IN ('planned');
  UPDATE manufacturing_orders SET status='done' WHERE status IN ('to_close','not_assigned','done');
  -- cancelled kept as-is
  -- Drop and recreate the constraint
  EXECUTE 'ALTER TABLE manufacturing_orders DROP CONSTRAINT IF EXISTS manufacturing_orders_status_check';
  EXECUTE 'ALTER TABLE manufacturing_orders ADD CONSTRAINT manufacturing_orders_status_check CHECK (status IN (''draft'',''confirmed'',''in_progress'',''done'',''cancelled''))';
END;$$ LANGUAGE plpgsql;
