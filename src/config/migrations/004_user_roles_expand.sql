-- Migration 004: Expand user roles to new simplified set
-- Existing constraint allows ('owner/admin','manufacturing_manager','operator','inventory_manager')
-- We want canonical: admin, manager, operator, inventory
-- Strategy: update existing rows to mapped legacy values & replace constraint

DO $$
DECLARE constraint_name text; 
BEGIN
  SELECT con.constraint_name INTO constraint_name
  FROM information_schema.table_constraints con
  WHERE con.table_name='users' AND con.constraint_type='CHECK' AND con.constraint_name LIKE '%role%';
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', constraint_name);
  END IF;
END$$;

-- Now map legacy values to canonical ones (constraint dropped so updates won't fail)
UPDATE users SET role='admin' WHERE role='owner/admin';
UPDATE users SET role='manager' WHERE role='manufacturing_manager';
UPDATE users SET role='inventory' WHERE role='inventory_manager';

-- Add new simplified constraint
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin','manager','inventory','operator'));
