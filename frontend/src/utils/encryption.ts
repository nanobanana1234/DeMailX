// Encryption utilities for email messages
// Simple AES encryption for demo (in production, use more secure methods)

const ENCRYPTION_KEY_STORAGE = 'demailx_encryption_key';

/**
 * Generate or retrieve encryption key
 */
export function getOrCreateEncryptionKey(): string {
  let key = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
  if (!key) {
    // Generate a simple key (in production, use proper key generation)
    key = generateKey();
    localStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
  }
  return key;
}

/**
 * Generate a simple encryption key
 */
function generateKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple encryption (XOR for demo - in production use proper AES)
 */
export function encryptMessage(message: string, key?: string): string {
  const encryptionKey = key || getOrCreateEncryptionKey();
  const keyBytes = hexToBytes(encryptionKey);
  const messageBytes = stringToBytes(message);
  
  const encrypted = new Uint8Array(messageBytes.length);
  for (let i = 0; i < messageBytes.length; i++) {
    encrypted[i] = messageBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return bytesToHex(encrypted);
}

/**
 * Simple decryption
 */
export function decryptMessage(encryptedHex: string, key?: string): string {
  const encryptionKey = key || getOrCreateEncryptionKey();
  const keyBytes = hexToBytes(encryptionKey);
  const encrypted = hexToBytes(encryptedHex);
  
  const decrypted = new Uint8Array(encrypted.length);
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return bytesToString(decrypted);
}

// Helper functions
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

