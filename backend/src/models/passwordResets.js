import crypto from 'crypto';
import { query } from '../config/db.js';

export function hashOtp(otp){ return crypto.createHash('sha256').update(otp).digest('hex'); }

export async function createOtp(email, otp, ttlMinutes=10){
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now()+ ttlMinutes*60000);
  await query('INSERT INTO password_resets(email, otp_hash, expires_at) VALUES($1,$2,$3)', [email, otpHash, expiresAt]);
  return { otp, expiresAt };
}

export async function consumeOtp(email, otp){
  const otpHash = hashOtp(otp);
  const res = await query('SELECT * FROM password_resets WHERE email=$1 AND otp_hash=$2 AND consumed_at IS NULL AND expires_at > NOW() ORDER BY id DESC LIMIT 1',[email, otpHash]);
  const row = res.rows[0];
  if(!row) return false;
  await query('UPDATE password_resets SET consumed_at=NOW() WHERE id=$1',[row.id]);
  return true;
}
