import crypto from "crypto";
import { securityLogger } from "./security"; // ✅ central logger

/**
 * Encryption Service for PHI/PII Data Protection
 * Column-level AES-256-GCM encryption with key rotation support
 */

// Encryption configuration
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const TAG_LENGTH = 16; // 128 bits
const AAD = Buffer.from("aorta-mesh-phi"); // Additional authenticated data

// Validate and fetch encryption key
function getEncryptionKey(): Buffer {
  const keyHex = process.env.DATABASE_ENCRYPTION_KEY;

  if (keyHex) {
    if (keyHex.length !== KEY_LENGTH * 2) {
      throw new Error("DATABASE_ENCRYPTION_KEY must be a 64-character hex string (256-bit key).");
    }
    return Buffer.from(keyHex, "hex");
  }

  const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
  if (isDevelopment) {
    securityLogger.warn(
      "⚠️ Using ephemeral generated encryption key for development. Data will not persist across restarts!"
    );
    return crypto.randomBytes(KEY_LENGTH);
  }

  throw new Error("DATABASE_ENCRYPTION_KEY environment variable is required for production");
}

const encryptionKey = getEncryptionKey();

/**
 * Encrypt sensitive data (PHI/PII)
 */
export function encryptPHI(plaintext: string): string {
  if (!plaintext) return plaintext;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    cipher.setAAD(AAD);

    let encrypted = cipher.update(plaintext, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, encrypted, authTag]).toString("base64");
  } catch (error) {
    securityLogger.error("❌ Encryption failed", { error: (error as Error).message });
    throw new Error("Failed to encrypt sensitive data");
  }
}

/**
 * Decrypt sensitive data (PHI/PII)
 */
export function decryptPHI(encryptedData: string): string {
  if (!encryptedData) return encryptedData;

  try {
    const combined = Buffer.from(encryptedData, "base64");
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);
    decipher.setAAD(AAD);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  } catch (error) {
    securityLogger.error("❌ Decryption failed", { error: (error as Error).message });
    throw new Error("Failed to decrypt sensitive data");
  }
}

/**
 * Hash sensitive data for indexing/searching (one-way, salted SHA-256)
 */
export function hashForIndex(data: string): string {
  if (!data) return data;

  const salt = process.env.HASH_SALT || "aorta-mesh-salt";

  return crypto.createHash("sha256").update(data + salt).digest("hex");
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Key rotation utilities
 */
export class EncryptionKeyRotation {
  private static oldKeys: Buffer[] = [];

  static addOldKey(keyHex: string) {
    if (keyHex.length !== KEY_LENGTH * 2) {
      throw new Error("Old key must be a 64-character hex string");
    }
    const key = Buffer.from(keyHex, "hex");
    this.oldKeys.push(key);

    // Keep rotation set small
    if (this.oldKeys.length > 5) {
      this.oldKeys.shift();
    }

    securityLogger.info("🔑 Old encryption key registered for rotation");
  }

  static decryptWithRotation(encryptedData: string): string {
    try {
      return decryptPHI(encryptedData);
    } catch {
      for (const oldKey of this.oldKeys) {
        try {
          return this.decryptWithKey(encryptedData, oldKey);
        } catch {
          continue;
        }
      }
      throw new Error("Failed to decrypt with any available key");
    }
  }

  private static decryptWithKey(encryptedData: string, key: Buffer): string {
    const combined = Buffer.from(encryptedData, "base64");
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    decipher.setAAD(AAD);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  }
}

/**
 * PHI Data Types Helpers
 */
export const PHIEncryption = {
  encryptSSN: encryptPHI,
  decryptSSN: decryptPHI,
  encryptMRN: encryptPHI,
  decryptMRN: decryptPHI,
  encryptDOB: encryptPHI,
  decryptDOB: decryptPHI,
  encryptPhone: encryptPHI,
  decryptPhone: decryptPHI,
  encryptAddress: encryptPHI,
  decryptAddress: decryptPHI,
};
