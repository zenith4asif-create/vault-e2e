import { VaultBlob, VaultItem } from '../types/vault';

export const PBKDF2_ITERATIONS = 600_000;
export const SALT_BYTES = 16;
export const IV_BYTES = 12;
export const VAULT_VERSION = 1;

const enc = new TextEncoder();
const dec = new TextDecoder();

export function toBase64(buf: ArrayBuffer | ArrayBufferView | ArrayBufferLike): string {
  const bytes = new Uint8Array(
    'buffer' in (buf as object) ? ((buf as ArrayBufferView).buffer as ArrayBuffer) : (buf as ArrayBuffer)
  );
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

export function fromBase64(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes.buffer;
}

export function randomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

export async function deriveKey(masterPassword: string, saltBytes: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptVault(
  vaultObj: { items: VaultItem[] },
  key: CryptoKey,
  saltBase64: string
): Promise<VaultBlob> {
  const salt = new Uint8Array(fromBase64(saltBase64));
  const iv = randomBytes(IV_BYTES);
  const plaintext = enc.encode(JSON.stringify(vaultObj));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    plaintext
  );

  return {
    version: VAULT_VERSION,
    salt: toBase64(salt.buffer as ArrayBuffer),
    iv: toBase64(iv.buffer as ArrayBuffer),
    ciphertext: toBase64(ciphertext),
    updatedAt: Date.now()
  };
}

export async function decryptVault(
  blob: VaultBlob,
  key: CryptoKey
): Promise<{ items: VaultItem[] }> {
  const iv = new Uint8Array(fromBase64(blob.iv));
  const ciphertext = fromBase64(blob.ciphertext);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    ciphertext
  );
  return JSON.parse(dec.decode(plaintext));
}

// Generate strong password with customizable parameters
export function generatePassword(
  length = 20,
  options: {
    numbers?: boolean;
    symbols?: boolean;
    uppercase?: boolean;
    lowercase?: boolean;
  } = {}
): string {
  const {
    numbers = true,
    symbols = true,
    uppercase = true,
    lowercase = true
  } = options;

  let charset = '';
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (numbers) charset += '0123456789';
  if (symbols) charset += '!@#$%^&*()-_=+[]{};:,.?';

  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const randomValues = crypto.getRandomValues(new Uint32Array(length));
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

export function evaluatePasswordStrength(password: string): {
  score: number; // 0 to 5
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Ultra Secure';
  percent: number;
} {
  if (!password) {
    return { score: 0, label: 'Very Weak', percent: 0 };
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const labels: Array<'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Ultra Secure'> = [
    'Very Weak',
    'Weak',
    'Medium',
    'Medium',
    'Strong',
    'Ultra Secure'
  ];

  return {
    score,
    label: labels[score],
    percent: (score / 5) * 100
  };
}
