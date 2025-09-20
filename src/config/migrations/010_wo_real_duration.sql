-- Migration 010: Add real_duration_mins to work_orders and backfill
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS real_duration_mins NUMERIC;

-- Backfill existing rows where both started_at and ended_at are present and real_duration_mins is null
UPDATE work_orders
SET real_duration_mins = EXTRACT(EPOCH FROM (ended_at - started_at))/60.0
WHERE started_at IS NOT NULL AND ended_at IS NOT NULL AND real_duration_mins IS NULL;
