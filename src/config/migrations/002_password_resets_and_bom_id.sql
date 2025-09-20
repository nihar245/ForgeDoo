-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- bom_id now created in 001_init; retain conditional for legacy DBs
ALTER TABLE manufacturing_orders ADD COLUMN IF NOT EXISTS bom_id INT REFERENCES bom(id);
