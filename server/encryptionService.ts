import crypto from 'crypto';

/**
 * Encryption Service for PHI/PII Data Protection
 * Provides column-level encryption for sensitive healthcare data
 */

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Get encryption key from environment or generate one
function getEncryptionKey(): Buffer {
  const keyHex = process.env.DATABASE_ENCRYPTION_KEY;
  if (keyHex) {
    return Buffer.from(keyHex, 'hex');
  }
  
  // Default to development mode if NODE_ENV is not set or is 'development'
  // This prevents crash loops in deployment environments that haven't set NODE_ENV
  const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.warn('⚠️  Using generated encryption key for development. Set DATABASE_ENCRYPTION_KEY for production!');
    return crypto.randomBytes(KEY_LENGTH);
  }
  
  throw new Error('DATABASE_ENCRYPTION_KEY environment variable is required for production');
}

const encryptionKey = getEncryptionKey();

/**
 * Encrypt sensitive data (PHI/PII)
 * @param plaintext - The data to encrypt
 * @returns Base64 encoded encrypted data with IV and auth tag
 */
export function encryptPHI(plaintext: string): string {
  if (!plaintext) return plaintext;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    cipher.setAAD(Buffer.from('aorta-mesh-phi')); // Additional authenticated data
    
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([
      iv,
      encrypted,
      authTag
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypt sensitive data (PHI/PII)
 * @param encryptedData - Base64 encoded encrypted data
 * @returns Decrypted plaintext
 */
export function decryptPHI(encryptedData: string): string {
  if (!encryptedData) return encryptedData;
  
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract IV, encrypted data, and auth tag
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from('aorta-mesh-phi'));
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Hash sensitive data for indexing/searching (one-way)
 * @param data - The data to hash
 * @returns SHA-256 hash
 */
export function hashForIndex(data: string): string {
  if (!data) return data;
  
  return crypto
    .createHash('sha256')
    .update(data + process.env.HASH_SALT || 'aorta-mesh-salt')
    .digest('hex');
}

/**
 * Generate a secure random token
 * @param length - Token length in bytes
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Key rotation utilities
 */
export class EncryptionKeyRotation {
  private static oldKeys: Buffer[] = [];
  
  /**
   * Add an old key for backward compatibility during rotation
   */
  static addOldKey(keyHex: string) {
    this.oldKeys.push(Buffer.from(keyHex, 'hex'));
  }
  
  /**
   * Try to decrypt with old keys if current key fails
   */
  static decryptWithRotation(encryptedData: string): string {
    try {
      // Try current key first
      return decryptPHI(encryptedData);
    } catch (error) {
      // Try old keys
      for (const oldKey of this.oldKeys) {
        try {
          return this.decryptWithKey(encryptedData, oldKey);
        } catch {
          continue;
        }
      }
      throw new Error('Failed to decrypt with any available key');
    }
  }
  
  private static decryptWithKey(encryptedData: string, key: Buffer): string {
    const combined = Buffer.from(encryptedData, 'base64');
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from('aorta-mesh-phi'));
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  }
}

/**
 * PHI Data Types - Helper functions for common medical data
 */
export const PHIEncryption = {
  // Social Security Number
  encryptSSN: (ssn: string) => encryptPHI(ssn),
  decryptSSN: (encrypted: string) => decryptPHI(encrypted),
  
  // Medical Record Number
  encryptMRN: (mrn: string) => encryptPHI(mrn),
  decryptMRN: (encrypted: string) => decryptPHI(encrypted),
  
  // Date of Birth
  encryptDOB: (dob: string) => encryptPHI(dob),
  decryptDOB: (encrypted: string) => decryptPHI(encrypted),
  
  // Phone Numbers
  encryptPhone: (phone: string) => encryptPHI(phone),
  decryptPhone: (encrypted: string) => decryptPHI(encrypted),
  
  // Address Information
  encryptAddress: (address: string) => encryptPHI(address),
  decryptAddress: (encrypted: string) => decryptPHI(encrypted)
};