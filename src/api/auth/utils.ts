import * as crypto from 'crypto';
import { resolveMx } from 'dns/promises';

export const encryptPassword = (password: string): string => {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
};

export const checkPassword = (
  password: string,
  hashedPassword: string,
): boolean => {
  if (!password || !hashedPassword) return false;
  const [salt, storedHash] = hashedPassword.split(':');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return storedHash === hash;
};

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export function generateOTP(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

function isValidEmailFormat(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function hasValidDomain(email: string) {
  const domain = email.split('@')[1];
  try {
    const addresses = await resolveMx(domain);
    return addresses && addresses.length > 0; // Domínio válido se tiver registros MX.
  } catch {
    return false; // Erro ao resolver MX, domínio inválido.
  }
}

export async function isEmailValid(email: string) {
  if (!isValidEmailFormat(email)) {
    console.error('Formato de e-mail inválido:', email);
    return false;
  }

  const domainValid = await hasValidDomain(email);
  if (!domainValid) {
    console.error('Domínio do e-mail inválido:', email);
    return false;
  }

  return true;
}

export function generateRefererCode(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let refererCode = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    refererCode += characters[randomIndex];
  }

  return refererCode;
}
