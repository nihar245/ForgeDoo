import nodemailer from 'nodemailer';
import { config } from '../core/config.js';

let transporter = null;
export function getTransporter(){
  if(!config.mail.enabled) return null;
  if(!transporter){
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure === true,
      auth: config.mail.user ? { user: config.mail.user, pass: config.mail.password } : undefined
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, text, html }){
  const tx = getTransporter();
  if(!tx) return { skipped: true };
  const info = await tx.sendMail({ from: config.mail.from, to, subject, text, html });
  return { messageId: info.messageId };
}