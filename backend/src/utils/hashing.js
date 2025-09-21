import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
export async function hashPassword(pw) { return bcrypt.hash(pw, SALT_ROUNDS); }
export async function comparePassword(pw, hash) { return bcrypt.compare(pw, hash); }
