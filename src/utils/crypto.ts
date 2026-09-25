/**
 * Web Crypto API Engine - AES-256-GCM and PBKDF2 Key Derivation
 * 100% Client-side cryptographic operations without external server dependencies
 * Hardened to 310,000 iterations (OWASP Standard) with secure zeroing memory wiping
 */

declare const chrome: any;

export const PBKDF2_ITERATIONS = 310000;

export interface EncryptedPayload {
  version: number;
  salt: string; // Hex encoded salt (16 bytes)
  iv: string;   // Hex encoded 12-byte IV for AES-GCM
  ciphertext: string; // Hex encoded ciphertext with auth tag
}

// Convert ArrayBuffer to Hex string
export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
export function hexToBuffer(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const match = cleanHex.match(/.{1,2}/g);
  if (!match) return new Uint8Array(0);
  return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
}

/**
 * Memory Safety: Securely wipes sensitive memory buffers by overwriting with random noise then zeros
 */
export function wipeMemory(buffer: Uint8Array | ArrayBuffer | null | undefined): void {
  if (!buffer) return;
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  window.crypto.getRandomValues(bytes as any);
  bytes.fill(0);
}

/**
 * Derive AES-256-GCM CryptoKey from user master password using PBKDF2 with 310,000 iterations
 */
async function deriveEncryptionKey(
  password: string,
  saltBuffer: Uint8Array,
  usage: KeyUsage[]
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive key
  const derived = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer as any,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    usage
  );

  // Wipe raw password buffer from memory
  wipeMemory(passwordBuffer);

  return derived;
}

/**
 * Encrypt arbitrary string data (Seed phrase, private key, accounts) using AES-256-GCM
 */
export async function encryptData(
  plainText: string,
  masterPassword: string
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);

  // Generate cryptographic random salt (16 bytes) and IV (12 bytes for AES-GCM standard)
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveEncryptionKey(masterPassword, salt, ['encrypt']);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
      tagLength: 128,
    },
    key,
    data
  );

  // Wipe unencrypted plaintext buffer immediately
  wipeMemory(data);

  return {
    version: 2,
    salt: bufferToHex(salt),
    iv: bufferToHex(iv),
    ciphertext: bufferToHex(cipherBuffer),
  };
}

/**
 * Decrypt AES-256-GCM encrypted payload back to plaintext
 */
export async function decryptData(
  payload: EncryptedPayload,
  masterPassword: string
): Promise<string> {
  try {
    const salt = hexToBuffer(payload.salt);
    const iv = hexToBuffer(payload.iv);
    const ciphertext = hexToBuffer(payload.ciphertext);

    // Support legacy 100,000 iterations or version 2 310,000 iterations seamlessly
    const iterations = payload.version >= 2 ? PBKDF2_ITERATIONS : 100000;

    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    wipeMemory(passwordBuffer);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as any,
        tagLength: 128,
      },
      key,
      ciphertext as any
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    throw new Error('Decryption failed. Incorrect master password or corrupted vault.');
  }
}

/**
 * Compute SHA-256 hash for checksum validation
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  wipeMemory(data);
  return bufferToHex(hashBuffer);
}

/**
 * Universal Storage helper: Works seamlessly in Chrome Extension (chrome.storage.local)
 * and in Standalone Web Preview (localStorage)
 */
export const StorageEngine = {
  async get<T>(key: string): Promise<T | null> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result: any) => {
          resolve((result && result[key]) || null);
        });
      });
    }
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      });
    }
    localStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.remove([key], () => resolve());
      });
    }
    localStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(() => resolve());
      });
    }
    localStorage.clear();
  },
};
