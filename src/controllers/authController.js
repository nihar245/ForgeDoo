import Joi from 'joi';
import { createUser, findUserByEmail, getUserById } from '../models/users.js';
import { hashPassword, comparePassword } from '../utils/hashing.js';
import { createOtp, consumeOtp } from '../models/passwordResets.js';
import crypto from 'crypto';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js';
import { badRequest, unauthorized } from '../core/apiError.js';

export const signupSchema = Joi.object({
  name: Joi.string().min(6).max(12).required(),
  email: Joi.string().email().required().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  password: Joi.string().min(9).required().pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).+$")).message('Password must include upper and lower case letters and a special character'),
  role: Joi.string().valid('admin','manager','inventory','operator').default('operator'),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  avatar: Joi.string().uri().optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
const forgotSchema = Joi.object({ email: Joi.string().email().required() });
const verifyOtpSchema = Joi.object({ email: Joi.string().email().required(), otp: Joi.string().length(6).required(), newPassword: Joi.string().min(8).required() });

export async function signup(req, res, next) {
  try {
    const { name, email, password, role } = await signupSchema.validateAsync(req.body);
    const existing = await findUserByEmail(email);
    if (existing) throw badRequest('Email already exists');
    const passwordHash = await hashPassword(password);
    let user;
    try {
      user = await createUser({ name, email, role, passwordHash });
    } catch(err){
      // If legacy constraint still present retry with mapped legacy role
      if(/users_role_check/.test(err.message)){
        const legacyRoleMap = { admin: 'owner/admin', manager: 'manufacturing_manager', inventory: 'inventory_manager', operator: 'operator' };
        const mapped = legacyRoleMap[role] || role;
        user = await createUser({ name, email, role: mapped, passwordHash });
      } else {
        throw err;
      }
    }
  const access = signAccess({ userId: user.id, role: user.role });
  const refresh = signRefresh({ userId: user.id, role: user.role });
  setAuthCookies(res, access, refresh);
  res.status(201).json({ user, token: access });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body);
    const user = await findUserByEmail(email);
    if (!user) throw unauthorized('Invalid credentials');
    let ok = false;
    try { ok = await comparePassword(password, user.password_hash); } catch(e){ ok = false; }
    if(!ok){
      // Fallback for legacy plain seeded data: if stored password matches plaintext, re-hash & persist
      if(user.password_hash === password){
        ok = true;
        try {
          const newHash = await hashPassword(password);
          await import('../config/db.js').then(({query})=>query('UPDATE users SET password_hash=$2 WHERE id=$1', [user.id, newHash]).catch(async ()=>{
            // If password_hash column missing, update password instead
            await import('../config/db.js').then(({query})=>query('UPDATE users SET password=$2 WHERE id=$1',[user.id,newHash]));
          }));
          user.password_hash = newHash;
        } catch(e){ /* ignore */ }
      } else {
        throw unauthorized('Invalid credentials');
      }
    }
  const access = signAccess({ userId: user.id, role: user.role });
  const refresh = signRefresh({ userId: user.id, role: user.role });
  setAuthCookies(res, access, refresh);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: access });
  } catch (e) { next(e); }
}

export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    res.json({ user });
  } catch (e) { next(e); }
}

export async function forgotPassword(req, res, next){
  try {
    const { email } = await forgotSchema.validateAsync(req.body);
    const user = await findUserByEmail(email);
    // Always respond success even if user not found to avoid enumeration
    if(user){
      const otp = (''+Math.floor(Math.random()*1e6)).padStart(6,'0');
      await createOtp(email, otp, 10);
      // In production we would send email. For dev/testing echo it.
      res.json({ message: 'OTP sent', dev: { otp } });
    } else {
      res.json({ message: 'OTP sent' });
    }
  } catch(e){ next(e);} }

export async function verifyOtp(req, res, next){
  try {
    const { email, otp, newPassword } = await verifyOtpSchema.validateAsync(req.body);
    const ok = await consumeOtp(email, otp);
    if(!ok) return next(badRequest('Invalid or expired OTP'));
    const user = await findUserByEmail(email);
    if(!user) return next(badRequest('User missing'));
    const newHash = await hashPassword(newPassword);
    try {
      await import('../config/db.js').then(({query})=>query('UPDATE users SET password_hash=$2 WHERE id=$1',[user.id, newHash]));
    } catch(e){
      if(/column \"password_hash\"/.test(e.message)){
        await import('../config/db.js').then(({query})=>query('UPDATE users SET password=$2 WHERE id=$1',[user.id, newHash]));
      } else throw e;
    }
    res.json({ message: 'Password reset' });
  } catch(e){ next(e);} }

// Helper to set auth cookies (moved outside to reuse in multiple handlers)
function setAuthCookies(res, access, refresh){
  const accessMaxAgeMs = (parseInt(process.env.ACCESS_TOKEN_TTL_MIN || '60',10))*60*1000;
  const refreshMaxAgeMs = (parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '7',10))*24*60*60*1000;
  const common = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' };
  res.cookie('access_token', access, { ...common, maxAge: accessMaxAgeMs, path: '/' });
  res.cookie('refresh_token', refresh, { ...common, maxAge: refreshMaxAgeMs, path: '/auth' });
}

export async function refresh(req, res, next){
  try {
    const token = req.cookies?.refresh_token;
    if(!token) return next(unauthorized('Missing refresh token'));
    const payload = verifyRefresh(token);
    if(!payload) return next(unauthorized('Invalid refresh token'));
    const access = signAccess({ userId: payload.userId, role: payload.role });
    const rotate = signRefresh({ userId: payload.userId, role: payload.role });
    setAuthCookies(res, access, rotate);
    res.json({ token: access });
  } catch(e){ next(e); }
}

export async function logout(_req, res, _next){
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/auth' });
  res.status(204).end();
}
