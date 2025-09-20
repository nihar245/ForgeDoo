-- ============================================================
-- Unified Init Schema (Consolidated from 001-014)
-- Date: 2025-09-20
-- This file represents the FINAL schema after all prior incremental migrations.
-- If adopting a clean-slate migration strategy, remove old migration files
-- and keep ONLY this as 001_init.sql.
-- ============================================================

-- Drop in dependency-safe order (if existing)
DROP TABLE IF EXISTS stock_ledger CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS manufacturing_orders CASCADE;
DROP TABLE IF EXISTS bom_operations CASCADE;
DROP TABLE IF EXISTS bom_components CASCADE;
DROP TABLE IF EXISTS bom CASCADE;
DROP TABLE IF EXISTS work_centers CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================
-- USERS
-- =============================
CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','manager','inventory','operator')),
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================
-- PASSWORD RESETS (OTP)
-- =============================
CREATE TABLE password_resets(
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_password_resets_email ON password_resets(email);

-- =============================
-- PRODUCTS (Unified: Raw Materials + Finished Products)
-- =============================
CREATE TABLE products(
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('raw_material','semi_finished','finished')),
  type VARCHAR(30) NOT NULL CHECK (type IN ('finished','raw_material','semi_finished')), -- Legacy compatibility
  uom VARCHAR(30) NOT NULL,
  unit_cost DECIMAL(12,4) DEFAULT 0,
  is_component BOOLEAN DEFAULT FALSE, -- Helper flag: true for raw materials, false for finished products
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================
-- BILL OF MATERIALS (BOM)
-- =============================
CREATE TABLE bom(
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  version VARCHAR(10),
  output_quantity DECIMAL(10,2) DEFAULT 1,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bom_components(
  id SERIAL PRIMARY KEY,
  bom_id INT REFERENCES bom(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id), -- References raw material from unified products table
  quantity DECIMAL(10,2) NOT NULL
);

CREATE TABLE bom_operations(
  id SERIAL PRIMARY KEY,
  bom_id INT REFERENCES bom(id) ON DELETE CASCADE,
  operation_name VARCHAR(100) NOT NULL,
  sequence INT NOT NULL, -- ✅ ADD THIS
  workcenter_id INT REFERENCES work_centers(id), -- ✅ ADD FK CONSTRAINT
  duration_mins INT
);
ALTER TABLE bom ADD CONSTRAINT unique_product_version UNIQUE (product_id, version);
ALTER TABLE bom_operations ADD CONSTRAINT unique_bom_sequence UNIQUE (bom_id, sequence);
--
-- =============================
-- WORK CENTERS
-- =============================
CREATE TABLE work_centers(
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity_per_hour INT,
  cost_per_hour DECIMAL(10,2),
  location VARCHAR(100)
);


-- =============================
-- MANUFACTURING ORDERS (final simplified lifecycle)
-- statuses: draft, confirmed, in_progress, done, cancelled
-- component_status: available | not_available | NULL
-- =============================
CREATE TABLE manufacturing_orders(
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL,
  created_by INT REFERENCES users(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft','confirmed','in_progress','done','cancelled')),
  start_date DATE,
  end_date DATE,
  component_status VARCHAR(20) NULL CHECK (component_status IS NULL OR component_status IN ('available','not_available')),
  assignee_id INT REFERENCES users(id),
  bom_id INT REFERENCES bom(id)
);

-- =============================
-- WORK ORDERS (final statuses including cancelled + real_duration_mins)
-- =============================
CREATE TABLE work_orders(
  id SERIAL PRIMARY KEY,
  mo_id INT REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
  operation_name VARCHAR(100),
  assigned_to INT REFERENCES users(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending','in_progress','paused','done','cancelled')),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  real_duration_mins NUMERIC
);

-- =============================
-- STOCK LEDGER & INVENTORY
-- =============================
CREATE TABLE stock_ledger(
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  movement_type VARCHAR(10) CHECK (movement_type IN ('in','out')),
  quantity DECIMAL(10,2) NOT NULL,
  reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================
-- ASSIGNEE TRIGGER (enforce operator role)
-- =============================
CREATE OR REPLACE FUNCTION enforce_operator_assignee() RETURNS trigger AS $$
DECLARE r_role text;
BEGIN
  IF NEW.assignee_id IS NULL THEN RETURN NEW; END IF;
  SELECT role INTO r_role FROM users WHERE id = NEW.assignee_id;
  IF r_role IS NULL THEN RAISE EXCEPTION 'Assignee user % not found', NEW.assignee_id; END IF;
  IF r_role <> 'operator' THEN RAISE EXCEPTION 'Assignee user % must have role operator (found %)', NEW.assignee_id, r_role; END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mo_assignee_operator ON manufacturing_orders;
CREATE TRIGGER trg_mo_assignee_operator
  BEFORE INSERT OR UPDATE OF assignee_id ON manufacturing_orders
  FOR EACH ROW EXECUTE FUNCTION enforce_operator_assignee();

-- =============================
-- Helpful indexes
-- =============================
CREATE INDEX idx_mo_status ON manufacturing_orders(status);
CREATE INDEX idx_mo_product ON manufacturing_orders(product_id);
CREATE INDEX idx_wo_mo ON work_orders(mo_id);
CREATE INDEX idx_ledger_product ON stock_ledger(product_id);

-- End unified init