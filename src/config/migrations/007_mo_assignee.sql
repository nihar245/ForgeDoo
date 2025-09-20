-- Migration 007: Add assignee_id to manufacturing_orders restricted to users with role 'operator'

ALTER TABLE manufacturing_orders
  ADD COLUMN IF NOT EXISTS assignee_id INT REFERENCES users(id);

-- Use trigger to enforce that referenced user has role operator (cannot express via simple FK/CHECK reliably if role can change)
CREATE OR REPLACE FUNCTION enforce_operator_assignee() RETURNS trigger AS $$
DECLARE r_role text;
BEGIN
  IF NEW.assignee_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT role INTO r_role FROM users WHERE id = NEW.assignee_id;
  IF r_role IS NULL THEN
    RAISE EXCEPTION 'Assignee user % not found', NEW.assignee_id;
  END IF;
  IF r_role <> 'operator' THEN
    RAISE EXCEPTION 'Assignee user % must have role operator (found %)', NEW.assignee_id, r_role;
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mo_assignee_operator ON manufacturing_orders;
CREATE TRIGGER trg_mo_assignee_operator
  BEFORE INSERT OR UPDATE OF assignee_id ON manufacturing_orders
  FOR EACH ROW EXECUTE FUNCTION enforce_operator_assignee();

-- Existing rows remain with NULL assignee_id unless updated explicitly.