// Server-only crypto utilities (uses Node.js crypto)
// ONLY import this in API routes, never in client components

import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function generateSalt(): string {
  return randomBytes(32).toString('hex');
}

export function generateId(length: number = 12): string {
  return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export function hashData(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function createCommitment(holder: string, claimsHash: string, salt: string): string {
  return hashData(`${holder}:${claimsHash}:${salt}`);
}

export function createClaimsHash(claims: any[], salt: string): string {
  return hashData(JSON.stringify(claims) + salt);
}

export function encrypt(text: string, secretKey: string): string {
  const iv = randomBytes(16);
  const key = Buffer.from(secretKey, 'hex');
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData: string, secretKey: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = Buffer.from(secretKey, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
