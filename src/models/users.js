import { query } from '../config/db.js';
import { comparePassword } from '../utils/hashing.js';

export async function createUser({ name, email, role, passwordHash }) {
  // Support legacy schema with 'password' column if password_hash absent
  let insertSql = `INSERT INTO users(name,email,role,password_hash) VALUES($1,$2,$3,$4) RETURNING id,name,email,role,created_at`;
  try {
    const res = await query(insertSql, [name, email, role, passwordHash]);
    return res.rows[0];
  } catch(e){
    if(/column \"password_hash\"/.test(e.message)){
      const fallback = await query('INSERT INTO users(name,email,role,password) VALUES($1,$2,$3,$4) RETURNING id,name,email,role,created_at',[name,email,role,passwordHash]);
      return fallback.rows[0];
    }
    throw e;
  }
}

export async function findUserByEmail(email) {
  const res = await query('SELECT * FROM users WHERE email=$1', [email]);
  if(!res.rowCount) return null;
  const u = res.rows[0];
  // Normalize to password_hash property for downstream code
  if(!u.password_hash && u.password){ u.password_hash = u.password; }
  // Normalize legacy roles to new canonical set if needed
  const legacyMap = {
    'owner/admin': 'admin',
    'manufacturing_manager': 'manager',
    'inventory_manager': 'inventory'
  };
  if(legacyMap[u.role]) u.role = legacyMap[u.role];
  return u;
}

export async function getUserById(id) {
  const res = await query('SELECT id,name,email,role,created_at FROM users WHERE id=$1', [id]);
  return res.rows[0];
}

export async function listUsers() {
  const res = await query('SELECT id,name,email,role,phone,created_at FROM users ORDER BY id');
  const legacyMap = {
    'owner/admin': 'admin',
    'manufacturing_manager': 'manager',
    'inventory_manager': 'inventory'
  };
  return res.rows.map(r=>({ ...r, role: legacyMap[r.role] || r.role }));
}

export async function updateUser(id, { name, phone, role }) {
  const res = await query('UPDATE users SET name=COALESCE($2,name), phone=COALESCE($3,phone), role=COALESCE($4,role) WHERE id=$1 RETURNING id,name,email,role,phone,created_at', [id, name, phone, role]);
  return res.rows[0];
}

export async function deleteUser(id) {
  await query('DELETE FROM users WHERE id=$1', [id]);
}

// WARNING: Searching users by raw password is generally a BAD idea.
// Passwords should never be used as a lookup key. This function exists only
// because it was explicitly requested. It performs a linear scan of all users
// and bcrypt-compares each stored hash, which is O(N) and expensive.
// If the real requirement is to enforce password uniqueness across users,
// prefer adding a separate deterministic, irreversible fingerprint column
// (e.g., SHA256(PEPPER || password)) with a UNIQUE index. Do NOT reuse bcrypt
// hashes for direct equality because bcrypt salts make identical passwords
// produce different hashes.
export async function findUserByPassword(rawPassword) {
  if(!rawPassword) return null;
  // Fetch minimal columns; include legacy password column fallback
  const res = await query('SELECT id,name,email,role,password_hash,password FROM users');
  const legacyMap = {
    'owner/admin': 'admin',
    'manufacturing_manager': 'manager',
    'inventory_manager': 'inventory'
  };
  for (const row of res.rows) {
    const hash = row.password_hash || row.password; // legacy fallback
    if(!hash) continue;
    let match = false;
    try { match = await comparePassword(rawPassword, hash); } catch { match = false; }
    if (match) {
      const role = legacyMap[row.role] || row.role;
      return { id: row.id, name: row.name, email: row.email, role };
    }
  }
  return null;
}
